import React from 'react';
import { ButtonExplanationData } from './ButtonExplanationModal';

// Complete dictionary of translated onInspect button explanations
export const BUTTON_EXPLANATIONS_EN: Record<string, {
  title: string;
  purpose?: string;
  singleClickAction?: string;
  longPressAction?: string;
}> = {
  "صندوق الذكر الحالي": {
    "title": "Current Dhikr Box",
    "purpose": "Displays the currently selected Dhikr or Tasbeeh phrase. Tap in the original page to choose from built-in authentic adhkar or add your custom dhikr. Swipe left or right for quick navigation."
  },
  "زر إضافة ذكر مخصص": {
    "title": "Add Custom Dhikr Button",
    "purpose": "Allows you to type any custom dhikr, tasbeeh, or personal dua, specify target count, and save it immediately to your custom adhkar list."
  },
  "زر حذف الذكر": {
    "title": "Delete Dhikr Button",
    "purpose": "Allows you to delete any custom dhikr you added previously when you no longer need it in your list."
  },
  "زر لون العداد": {
    "title": "Counter Color Button",
    "purpose": "Enables you to customize and change the ring and button color of the Tasbeeh counter to suit your preference from an elegant color palette."
  },
  "زر شكل العداد": {
    "title": "Counter Style Button",
    "purpose": "Allows switching between 3 different styles of the counter: Modern Digital, Classic Bead Ring, and Realistic 3D Sliding Beads with haptics."
  },
  "زر الرسم البياني": {
    "title": "Analytics Chart Button",
    "purpose": "Opens an analytical chart illustrating your tasbeeh progress, daily and monthly achievements, and consistency in remembrance of Allah."
  },
  "بطاقة الهدف الرقمي": {
    "title": "Target Number Card",
    "purpose": "Displays the target count for the current session (such as 33 or 100). When reaching this target, the app notifies you with a gentle chime and haptic feedback."
  },
  "زر التسبيح والعد الذكي": {
    "title": "Smart Tasbeeh & Count Button",
    "purpose": "Main counter button; tapping increases count by 1 with gentle haptic vibration simulating real tasbeeh beads and a subtle audio click."
  },
  "زر تعديل الهدف": {
    "title": "Edit Target Button",
    "purpose": "Allows changing the target count, choosing presets (33, 100, 1000), custom numbers, or open unlimited counting."
  },
  "زر تصفير العداد": {
    "title": "Reset Counter Button",
    "purpose": "Resets the current session counter to zero while automatically preserving your total historical count in permanent statistics."
  },
  "بطاقة التطور الأسبوعي والشهري": {
    "title": "Weekly & Monthly Progress Card",
    "purpose": "Displays a comprehensive report and chart of your tasbeeh growth over days and weeks to motivate steadfastness in remembering Allah Almighty."
  },
  "تبويبات مجتمع التواصل": {
    "title": "Community Tabs Bar",
    "purpose": "Allows seamless navigation between the 4 community sections: Direct Chats with friends, Public Community Rooms, Members Directory, and Blocked Users management."
  },
  "خانة البحث عن الأصدقاء والقُرّاء": {
    "title": "Search Friends & Reciters Field",
    "purpose": "Allows searching by name or country for any friend or Quran reader in the app community to initiate instant conversations or add them to your contacts."
  },
  "زر تحديث المحادثات": {
    "title": "Refresh Chats Button",
    "purpose": "Instantly reloads and fetches the latest messages, discussions, and friends list from the server."
  },
  "محادثة الدعم الفني وإدارة التطبيق": {
    "title": "Technical Support & Administration Chat",
    "purpose": "Direct channel for 24/7 instant contact with app administrators and moderators for feedback, reporting issues, or requesting assistance."
  },
  "بطاقة المحادثة الخاصة مع الصديق": {
    "title": "Private Chat Card with Friend",
    "purpose": "Opens a direct chat conversation with a friend to exchange text messages, voice notes, Quranic verses, and mutual spiritual reminders."
  },
  "خانة البحث في الأدعية": {
    "title": "Supplications Search Field",
    "purpose": "Allows searching across hundreds of authentic Quranic and Prophetic supplications by keywords or occasions for quick access."
  },
  "عداد تكرار الدعاء": {
    "title": "Dua Repetition Counter",
    "purpose": "Shows the current repetition count for this supplication to attain abundant reward."
  },
  "شارة عدد المرات المستحبة": {
    "title": "Recommended Repetitions Badge",
    "purpose": "Indicates the Prophetic Sunnah for reciting this supplication (e.g. recited once)."
  },
  "نص الدعاء القرآني المأثور": {
    "title": "Authentic Quranic Supplication Text",
    "purpose": "Blessed supplication from the Holy Quran, presented in Uthmani script with full diacritics for devout recitation."
  },
  "مصدر وتخريج الدعاء": {
    "title": "Supplication Reference & Source",
    "purpose": "Indicates the Quranic Surah and verse number or the authentic Hadith collection from which this supplication is cited."
  },
  "زر الاستماع الصوتي للدعاء": {
    "title": "Audio Recitation of Supplication",
    "purpose": "Plays clear, melodious audio pronunciation of this supplication with correct diacritics and Tajweed."
  },
  "زر مشاركة الدعاء": {
    "title": "Share Supplication Button",
    "purpose": "Shares the supplication text along with its source reference as a message or designed visual card with friends."
  },
  "زر نسخ نص الدعاء": {
    "title": "Copy Supplication Text Button",
    "purpose": "Copies the supplication text and reference to the clipboard to easily paste anywhere."
  },
  "زر تكبير الخط والقراءة": {
    "title": "Zoom Font & Reading Mode",
    "purpose": "Opens full-screen enlarged reading view with font size adjustments for optimal visual comfort."
  },
  "زر إضافة الدعاء للمفضلة": {
    "title": "Add Supplication to Favorites Button",
    "purpose": "Saves this supplication in your personal favorites list for quick access anytime."
  },
  "زر الفهرس السريع لأذكار الصلاة": {
    "title": "Quick Index for Prayer Adhkar",
    "purpose": "Opens a quick index categorizing adhkar before prayer, during bowing and prostration, and post-prayer remembrance."
  },
  "نص ذكر الصلاة المأثور": {
    "title": "Authentic Prayer Remembrance Text",
    "purpose": "Text of authentic adhkar prescribed following obligatory prayers according to the purified Sunnah."
  },
  "شارة التكرار المستحب": {
    "title": "Recommended Recitation Count Badge",
    "purpose": "Shows the prescribed number of repetitions according to authentic Prophetic tradition."
  },
  "بطاقة سنن الصلوات الرواتب اليومية (12 ركعة)": {
    "title": "Daily Sunnah Rawatib Prayers Card (12 Rak'ahs)",
    "purpose": "Summarizes the 12 daily confirmed Sunnah prayers: 2 before Fajr, 4 before Dhuhr, 2 after Dhuhr, 2 after Maghrib, and 2 after Isha for a palace in Jannah."
  },
  "خانة البحث في حصن المسلم": {
    "title": "Search Fortress of the Muslim Field",
    "purpose": "Enables searching all chapters and categories of Hisn Al-Muslim (Fortress of the Muslim) by topic or situation."
  },
  "زر الفهرس الشامل لحصن المسلم": {
    "title": "Comprehensive Index of Hisn Al-Muslim",
    "purpose": "Displays the complete table of contents with all 130+ situations and chapters of daily remembrance."
  },
  "بطاقة باب أو قسم الذكر": {
    "title": "Chapter / Situation Remembrance Card",
    "purpose": "Opens the selected chapter to view all verified adhkar and supplications associated with that specific occasion."
  },
  "شريط التبديل بين التقويم ومحول التاريخ": {
    "title": "Calendar & Date Converter Toggle Bar",
    "purpose": "Switch between the monthly Hijri/Gregorian interactive calendar view and the instant date conversion tool."
  },
  "شريط اختيار الشهر والأرشيف": {
    "title": "Month & Archive Selector Bar",
    "purpose": "Enables moving forwards or backwards between Hijri months and years to explore historical dates and Islamic occasions."
  },
  "زر الشهر السابق": {
    "title": "Previous Month Button",
    "purpose": "Navigate to the preceding Hijri month."
  },
  "زر الشهر التالي": {
    "title": "Next Month Button",
    "purpose": "Navigate to the upcoming Hijri month."
  },
  "بطاقة أبرز المناسبات والأحداث الإسلامية": {
    "title": "Prominent Islamic Occasions Card",
    "purpose": "Highlights major upcoming Islamic events such as Ramadan, Eid al-Fitr, Day of Arafah, Eid al-Adha, and Isra & Mi'raj."
  },
  "تبويبات أذكار الصباح والمساء": {
    "title": "Morning & Evening Adhkar Tabs",
    "purpose": "Seamlessly switch between Morning Adhkar, Evening Adhkar, Sleep Adhkar, and Waking Up Adhkar."
  },
  "زر الفهرس السريع لأذكار اليوم والليلة": {
    "title": "Quick Index for Day & Night Adhkar",
    "purpose": "Provides a fast jump menu to any specific morning or evening dhikr."
  },
  "عداد تكرار الذكر": {
    "title": "Dhikr Counter Badge",
    "purpose": "Interactive button counting your repetitions for each specific dhikr with haptic feedback upon completion."
  },
  "نص ذكر الصباح المأثور": {
    "title": "Authentic Morning Remembrance Text",
    "purpose": "Full text of the morning dhikr in clear script with its virtue and reward from the Sunnah."
  },
  "زر الاستماع الصوتي للذكر": {
    "title": "Play Dhikr Audio Button",
    "purpose": "Listen to correct pronunciation and recitation of this remembrance by a distinguished reciter."
  },
  "زر مشاركة الذكر": {
    "title": "Share Dhikr Button",
    "purpose": "Share this dhikr with friends and loved ones via WhatsApp and social messaging apps."
  },
  "زر نسخ نص الذكر": {
    "title": "Copy Dhikr Text Button",
    "purpose": "Copies the full text of this remembrance to your clipboard."
  },
  "زر تكبير الخط": {
    "title": "Enlarge Font Size Button",
    "purpose": "Increases font size for comfortable reading without eye strain."
  },
  "زر المفضلة": {
    "title": "Add to Favorites Button",
    "purpose": "Bookmarks this remembrance in your custom favorites collection."
  },
  "العد التنازلي للصلاة القادمة": {
    "title": "Next Prayer Countdown Timer",
    "purpose": "Displays exact hours, minutes, and seconds remaining until the adhan of the upcoming prayer."
  },
  "بطاقات الصلوات الخمس وسننها الرواتب": {
    "title": "Five Daily Prayers & Sunnah Cards",
    "purpose": "Displays exact adhan times for Fajr, Sunrise, Dhuhr, Asr, Maghrib, and Isha calculated according to your location."
  },
  "منتصف الليل الشرعي": {
    "title": "Islamic Midnight Calculation",
    "purpose": "Calculates the end of preferred Isha prayer time and the beginning of the second half of the night."
  },
  "الثلث الأخير من الليل": {
    "title": "Last Third of the Night Card",
    "purpose": "Indicates the blessed time of Divine Descent and Tahajjud prayer before Fajr."
  },
  "زر المواقيت الشهرية": {
    "title": "Monthly Prayer Times Schedule Button",
    "purpose": "Opens the complete monthly prayer timetable table for the current month with printing and export options."
  },
  "زر المساجد القريبة": {
    "title": "Nearby Mosques Locator Button",
    "purpose": "Finds nearby mosques and prayer spaces around your current GPS location on the map."
  },
  "أزرار ضبط وتعديل الدقائق (+ و -)": {
    "title": "Minute Calibration Adjustment Buttons (+ and -)",
    "purpose": "Fine-tunes prayer times by adding or subtracting minutes to precisely match your local mosque adhan."
  },
  "قرص البوصلة المغناطيسية وعقرب القبلة": {
    "title": "Magnetic Compass Dial & Qibla Needle",
    "purpose": "Directs you towards the Kaaba in Mecca with high sensor precision. Rotate your phone until the needle aligns with the Kaaba symbol."
  },
  "بطاقة زاوية القبلة: 244°": {
    "title": "Qibla Degree Card (244° South-West)",
    "purpose": "Shows the exact mathematical azimuth angle from true North to the Kaaba for your location."
  },
  "أنماط استعراض اتجاه القبلة": {
    "title": "Qibla Viewing Modes Toggle",
    "purpose": "Switch between the sensory magnetic compass view and live satellite aerial map line connecting your location to Mecca."
  },
  "قائمة اختيار القارئ الصوتي": {
    "title": "Reciter Selection Menu",
    "purpose": "Choose your preferred reciter from a collection of world-renowned Quranic reciters with various Riwayat (Hafs, Warsh, Qalun)."
  },
  "قائمة اختيار السورة القرآنية": {
    "title": "Surah Selection Menu",
    "purpose": "Select any of the 114 Surahs with duration, revelation type (Meccan/Medinan), and download status."
  },
  "زر التشغيل والإيقاف": {
    "title": "Play / Pause Button",
    "purpose": "Starts or pauses audio recitation while maintaining playback position."
  },
  "زر السورة السابقة": {
    "title": "Previous Surah Button",
    "purpose": "Jump to the previous Surah in the Quran."
  },
  "زر السورة التالية": {
    "title": "Next Surah Button",
    "purpose": "Jump to the next Surah in the Quran."
  },
  "مفتاح تكرار نفس السورة تلقائياً": {
    "title": "Repeat Same Surah Switch",
    "purpose": "Automatically loops the current Surah continuously for memorization and reflection."
  },
  "مفتاح التشغيل المتواصل (السورة التالية)": {
    "title": "Continuous Play Switch (Next Surah)",
    "purpose": "Automatically advances to the following Surah once the current Surah finishes."
  },
  "بطاقة مؤقت النوم الذكي": {
    "title": "Smart Sleep Timer Card",
    "purpose": "Sets a timer (15, 30, 60 minutes or end of Surah) after which audio recitation gracefully fades out and stops."
  },
  "خيارات مؤقت النوم (15 • 30 • 60 دقيقة • آخر السورة)": {
    "title": "Sleep Timer Presets (15 • 30 • 60 min • End of Surah)",
    "purpose": "Quick preset buttons to activate sleep timer with one tap."
  },
  "زر بدء / إيقاف مؤقت النوم": {
    "title": "Start / Cancel Sleep Timer Button",
    "purpose": "Toggles the countdown timer on or off."
  },
  "بطاقة المفضلات المحفوظة": {
    "title": "Saved Favorites Card",
    "purpose": "Quick access to your curated favorite Surahs and recitations."
  },
  "تشغيل السورة المفضلة مباشرة": {
    "title": "Play Favorite Surah Directly",
    "purpose": "Tap any favorited Surah to launch immediate audio playback."
  },
  "زر حذف السورة من المفضلة": {
    "title": "Remove from Favorites Button",
    "purpose": "Removes this Surah from your favorites list."
  },
  "زر تحميل المصحف والتلاوات": {
    "title": "Download Surahs & Audio Button",
    "purpose": "Downloads audio recitation files to your device for 100% offline playback without internet connection."
  },
  "تبويبات أهل القرآن الكريم": {
    "title": "Ahl Al-Qur'an Tabs",
    "purpose": "Switch between the Monthly Leaderboard, Cumulative All-Time Leaderboard, and Your Personal Reading Log."
  },
  "المتصدر بالمركز الأول (الميدالية الذهبية)": {
    "title": "1st Place Leader (Gold Medal)",
    "purpose": "Honors the top reciter of the Holy Quran for this month with total read pages and completed Khatmahs."
  },
  "المتصدر بالمركز الثاني (الميدالية الفضية)": {
    "title": "2nd Place Leader (Silver Medal)",
    "purpose": "Honors the second place reciter on the leaderboard."
  },
  "المتصدر بالمركز الثالث (الميدالية البرونزية)": {
    "title": "3rd Place Leader (Bronze Medal)",
    "purpose": "Honors the third place reciter on the leaderboard."
  },
  "بطاقة ترتيبك الشهري بين قراء القرآن": {
    "title": "Your Monthly Rank & Stats Card",
    "purpose": "Displays your personal rank among all app readers worldwide, pages read this month, and completed Khatmahs."
  },
  "زر فتح المصحف للقراءة": {
    "title": "Open Quran for Reading Button",
    "purpose": "Takes you directly to the Holy Quran to read your daily wird and increment your verified score."
  },
  "سورة الفاتحة (أم الكتاب والشافية)": {
    "title": "Surah Al-Faatiha (The Opening & The Cure)",
    "purpose": "The opening chapter of the Holy Quran, recited in every unit of prayer."
  },
  "نص الآية الكريمة": {
    "title": "Quranic Verse Text",
    "purpose": "Sacred text in Medina Uthmani script.",
    "singleClickAction": "Highlights the verse, toggles top/bottom toolbars for full-screen mode, and pauses or resumes autoscroll.",
    "longPressAction": "Opens verse context menu to share as a designed card, copy Uthmani text, or read Tafseer explanation."
  },
  "فاصل ورقم الآية (١)": {
    "title": "Verse Number Ornament (1)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٢)": {
    "title": "Verse Number Ornament (2)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٣)": {
    "title": "Verse Number Ornament (3)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٤)": {
    "title": "Verse Number Ornament (4)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٥)": {
    "title": "Verse Number Ornament (5)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٦)": {
    "title": "Verse Number Ornament (6)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "فاصل ورقم الآية (٧)": {
    "title": "Verse Number Ornament (7)",
    "purpose": "Verse divider and number.",
    "singleClickAction": "Opens concise Tafseer explaining vocabulary, context of revelation, and overall meaning.",
    "longPressAction": "Opens Tafseer books selector (Ibn Kathir, Al-Sa'di, Al-Jalalayn, Al-Qurtubi, Al-Tabari, Al-Baghawi, Al-Muyassar)."
  },
  "ترويسة السورة": {
    "title": "Surah Header Banner",
    "purpose": "Ornate header displaying Surah name, revelation location (Meccan/Medinan), and total ayah count."
  },
  "رقم الصفحة وتذييل المصحف الشريف": {
    "title": "Page Number & Quran Footer",
    "purpose": "Shows current page number, Juz, Hizb quarter, and allows jumping to any page."
  },
  "زر ورقم الصفحة": {
    "title": "Page Number Jump Button",
    "purpose": "Shows current page and allows typing any page number (1-604) for immediate navigation."
  },
  "زر اسم السورة ورقم الآية والجزء": {
    "title": "Surah Name & Surah Index Button",
    "purpose": "Opens the complete Quran index sorted by Surah, Juz, and revelation order."
  },
  "زر التلاوة الصوتية": {
    "title": "Audio Recitation Button",
    "purpose": "Starts synchronous audio recitation with verse-by-verse highlighting."
  },
  "زر العلامة المرجعية": {
    "title": "Bookmark Button",
    "purpose": "Saves your current reading position.",
    "singleClickAction": "Saves an instant bookmark on the current verse and page with one tap.",
    "longPressAction": "Opens the full list of saved bookmarks with dates and timestamps to jump or delete."
  },
  "زر التمرير التلقائي الذكي": {
    "title": "Smart Autoscroll Button",
    "purpose": "Scrolls Quran text automatically without touching the screen.",
    "singleClickAction": "Starts or pauses smooth hands-free autoscrolling.",
    "longPressAction": "Opens autoscroll speed settings to adjust reading pace."
  },
  "زر مشاركة الآية كبطاقة دعوية": {
    "title": "Share Verse as Visual Card Button",
    "purpose": "Designs and shares the selected verse on social media as an elegant Islamic card."
  },
  "زر دليل العمرة": {
    "title": "Umrah Rites Guide Button",
    "purpose": "Step-by-step interactive guide for Umrah: Ihram, Tawaf, Sa'i, and Tahallul."
  },
  "زر دليل الحج": {
    "title": "Hajj Rites Guide Button",
    "purpose": "Complete guide for the days of Hajj from the 8th of Dhul Hijjah (Tarwiyah) through the Days of Tashreeq."
  },
  "زر عَدّاد الطواف": {
    "title": "Tawaf Circuit Counter Button",
    "purpose": "Interactive counter tracking the 7 circuits of Tawaf around the Kaaba or Sa'i between Safa and Marwah."
  },
  "زر قائمة التجهيزات والأمتعة": {
    "title": "Hajj & Umrah Packing Checklist",
    "purpose": "Interactive checklist ensuring you pack all religious, medical, and personal essentials."
  },
  "بطاقة فضل الحج والعمرة": {
    "title": "Virtues of Hajj & Umrah Card",
    "purpose": "Authentic Hadiths on the immense rewards of accepted Hajj and expiation of sins."
  },
  "بطاقة الفرق بين الحج والعمرة": {
    "title": "Differences Between Hajj & Umrah Card",
    "purpose": "Clear jurisprudential comparison of pillars, obligations, timings, and rulings."
  },
  "بطاقة المواقيت المكانية": {
    "title": "Miqat Locations Card",
    "purpose": "Explains the spatial boundaries (Mawaqit) where pilgrims must enter Ihram based on their route."
  },
  "بطاقة محظورات الإحرام": {
    "title": "Ihram Prohibitions Card",
    "purpose": "Lists all actions forbidden while in the state of Ihram and their rulings."
  },
  "بطاقة ورد اليوم ونطاق الصفحات": {
    "title": "Today's Wird & Page Range Card",
    "purpose": "Displays your assigned daily reading range from your personalized Khatmah plan."
  },
  "بطاقة نسبة إنجاز الورد اليومي": {
    "title": "Daily Wird Completion Progress Card",
    "purpose": "Visual progress bar showing pages read today versus your target."
  },
  "زر تأكيد قراءة الورد اليومي (تمت القراءة)": {
    "title": "Confirm Today's Wird Read Button",
    "purpose": "Marks today's assigned reading as completed and logs your streak."
  },
  "زر تعديل إعدادات الختمة": {
    "title": "Edit Khatmah Settings Button",
    "purpose": "Adjust your completion timeline (e.g. 30 days, 60 days, 1 year) or custom pages per day."
  },
  "زر إعادة ضبط الختمة": {
    "title": "Reset Khatmah Plan Button",
    "purpose": "Restarts your Khatmah plan from Surah Al-Fatihah."
  },
  "تبويبات التحفيظ والمراجعة": {
    "title": "Memorization & Review Tabs",
    "purpose": "Switch between New Memorization, Repetition Practice, and Retention Review."
  },
  "خانة اختيار القارئ والمعلم": {
    "title": "Teacher Reciter Selector",
    "purpose": "Select a teaching reciter (such as Al-Husary or Al-Minshawi) with pauses for repetition."
  },
  "بطاقة تحديد نطاق الآيات للحفظ": {
    "title": "Verse Range Selection Card",
    "purpose": "Define start and end Surah and verses for this memorization session."
  },
  "زر بدء جلسة التحفيظ والترديد": {
    "title": "Start Repetition & Memorization Button",
    "purpose": "Launches the memorization player repeating each verse configured times."
  },
  "بطاقة إنجاز العبادات اليومية": {
    "title": "Daily Worship Progress Card",
    "purpose": "Shows your overall spiritual completion percentage for today across all obligatory and voluntary acts."
  },
  "بطاقات الأذكار وورد القرآن اليومي": {
    "title": "Daily Adhkar & Quran Wird Checklist",
    "purpose": "Interactive daily checkboxes for 5 prayers, Sunnah, Adhkar, and Quran recitation."
  },
  "زر إضافة عبادة مخصصة جديدة": {
    "title": "Add Custom Worship Habit Button",
    "purpose": "Add personal habits like voluntary fasting, charity, seeking forgiveness, or night prayer."
  },
  "تبويبات أقسام الرقية الشرعية": {
    "title": "Ruqyah Sections Tabs",
    "purpose": "Navigate between Comprehensive Quranic Ruqyah, Prophetic Supplications, and Guidelines."
  },
  "خانة البحث في آيات وأدعية الرقية": {
    "title": "Search Ruqyah Verses & Supplications Field",
    "purpose": "Find specific healing verses or protection supplications quickly."
  },
  "آية الكرسي (آية التحصين والوقاية العظمى)": {
    "title": "Ayat Al-Kursi (The Greatest Verse of Protection)",
    "purpose": "The greatest verse in the Quran for spiritual protection against evil."
  },
  "تبويبات السيرة النبوية الشريفة": {
    "title": "Prophetic Seerah Tabs",
    "purpose": "Browse the interactive Timeline, Key Milestones, Battles & Expeditions, and Character of Prophet ﷺ."
  },
  "شريط التمرير الزمني": {
    "title": "Interactive Seerah Timeline Bar",
    "purpose": "Chronological timeline spanning the birth of the Prophet ﷺ to the completion of the message."
  },
  "المعلم الأول: مولد النبي المصطفى ﷺ": {
    "title": "Milestone 1: Birth of Prophet Muhammad ﷺ",
    "purpose": "Birth of the final Messenger in Mecca in the Year of the Elephant and early childhood."
  },
  "المعلم الثاني: نزول الوحي الشريف وبدء البعثة": {
    "title": "Milestone 2: Descent of Revelation in Cave Hira",
    "purpose": "Descent of Jibreel with 'Iqra' and the commencement of the global Islamic message."
  },
  "المعلم الثالث: الهجرة النبوية الشريفة إلى المدينة": {
    "title": "Milestone 3: Prophetic Hijrah to Medina",
    "purpose": "The turning point establishing the first Muslim society and state in Yathrib."
  },
  "خانة البحث في المواقع الإسلامية": {
    "title": "Search Islamic Sites Field",
    "purpose": "Filter trusted Islamic platforms by knowledge field (Tafseer, Hadith, Fatwa, Fiqh)."
  },
  "مجمع الملك فهد لطباعة المصحف الشريف": {
    "title": "King Fahd Complex for Printing Holy Quran",
    "purpose": "World's leading publisher of verified Medina Mushafs and Quranic sciences."
  },
  "موقع الدرر السنية (الموسوعة الحديثية)": {
    "title": "Dorar Al-Saniyyah (Hadith & Creed Encyclopedia)",
    "purpose": "Premier reference for checking Hadith authenticity and Islamic jurisprudence."
  },
  "خانة البحث في الأربعين النووية": {
    "title": "Search Forty Hadith Field",
    "purpose": "Search across all 42 foundational hadiths by keyword or topic."
  },
  "الحديث الأول: إنما الأعمال بالنيات": {
    "title": "Hadith 1: Actions are by Intentions",
    "purpose": "Foundational principle of Islam establishing sincerity in all righteous deeds."
  },
  "الحديث الثاني: حديث جبريل عليه السلام": {
    "title": "Hadith 2: Hadith of Jibreel (Islam, Iman, Ihsan)",
    "purpose": "Comprehensive overview defining the pillars of Islam, faith, excellence, and the Hour."
  },
  "شريط تبويبات الحاسبة الشرعية": {
    "title": "Islamic Calculators Tabs Bar",
    "purpose": "Switch between Zakat on Cash & Savings, Gold & Silver, Zakat al-Fitr, and Islamic Inheritance."
  },
  "بطاقة نصاب الزكاة الشرعي وسعر الذهب": {
    "title": "Zakat Nisab Threshold & Gold Price Card",
    "purpose": "Displays current Nisab equivalent to 85 grams of pure 24K gold."
  },
  "حقول إدخال الأموال والمدخرات والديون": {
    "title": "Cash, Savings & Debts Input Fields",
    "purpose": "Enter your total liquid cash, bank savings, trade assets, and deductible debts."
  },
  "زر حساب الزكاة ونتيجة المبلغ الواجب إخراجه": {
    "title": "Calculate Zakat & Result Button",
    "purpose": "Calculates the net Zakat payable (2.5%) once the wealth exceeds Nisab and 1 Hijri year passes."
  },
  "تنبيه فقهي هام": {
    "title": "Important Jurisprudential Notice",
    "purpose": "Explains religious conditions for Zakat eligibility and scholarly rulings."
  },
  "زر الميكروفون المركزي وحالة الاستماع": {
    "title": "Central Microphone & Listening Status",
    "purpose": "Tap to speak your voice command in Arabic or English to control the app hands-free."
  },
  "قائمة الأوامر الصوتية المدعومة": {
    "title": "Supported Voice Commands Directory",
    "purpose": "Examples of voice instructions: 'Open Surah Al-Kahf', 'Play Morning Adhkar', 'When is Asr?'."
  },
  "مفتاح إظهار أيقونة التحكم الصوتي العائمة": {
    "title": "Floating Voice Assistant Icon Toggle",
    "purpose": "Enables a quick-access floating mic widget on all pages of the app."
  },
  "خانة البحث في أسماء الله الحسنى": {
    "title": "Search Names of Allah Field",
    "purpose": "Search across the 99 Beautiful Divine Names by name, meaning, or spiritual benefit."
  },
  "زر التبديل بين عرض الشبكة وقائمة الشرح": {
    "title": "Grid & Detailed List View Toggle",
    "purpose": "Switch between elegant calligraphy grid view and in-depth scholarly explanation list."
  },
  "اسم الله الأعظم: «اللَّه»": {
    "title": "The Greatest Name: 'Allah'",
    "purpose": "The proper name of the Creator, encompassing all divine attributes of majesty and perfection."
  },
  "الاسم الثاني: «الرَّحْمَٰن»": {
    "title": "Second Name: 'Ar-Rahman'",
    "purpose": "The Entirely Merciful Whose mercy encompasses all creation in this world."
  },
  "الاسم الثالث: «الرَّحِيم»": {
    "title": "Third Name: 'Ar-Raheem'",
    "purpose": "The Especially Merciful to believers in both this life and the Hereafter."
  },
  "الاسم الرابع: «الْمَلِك»": {
    "title": "Fourth Name: 'Al-Malik'",
    "purpose": "The Absolute Sovereign and Supreme Ruler of the entire universe."
  },
  "الاسم الخامس: «الْقُدُّوس»": {
    "title": "Fifth Name: 'Al-Quddus'",
    "purpose": "The Absolutely Pure and Free from all imperfection."
  },
  "الاسم السادس: «السَّلَام»": {
    "title": "Sixth Name: 'As-Salam'",
    "purpose": "The Source of Peace, Security, and Flawlessness."
  },
  "بطاقة شرح الاسم والأدلة من القرآن والسنة": {
    "title": "Name Meaning & Quranic Evidence Card",
    "purpose": "Scholarly explanation of the Name with scriptural references from the Quran and Sunnah."
  },
  "شعار وأيقونة تطبيق واتساب (WhatsApp)": {
    "title": "WhatsApp Official Badge & Contact Channel",
    "purpose": "Official verified WhatsApp channel for direct feedback, reports, and questions."
  },
  "عنوان للتواصل والاقتراحات": {
    "title": "Contact & Suggestions Heading",
    "purpose": "Heading for technical support and communication with the developers."
  },
  "اسم المطور ومسؤول التطبيق (علاء أحمد)": {
    "title": "Developer & App Admin (Alaa Ahmed)",
    "purpose": "Lead developer Alaa Ahmed Al-Morshedy dedication and ongoing charity notice."
  },
  "رقم هاتف الواتساب المعتمد للتواصل": {
    "title": "Verified WhatsApp Phone Number",
    "purpose": "Direct WhatsApp contact number: +201099684144."
  },
  "زر تواصل عبر الواتساب (فتح المحادثة)": {
    "title": "Chat on WhatsApp Button",
    "purpose": "Opens WhatsApp immediately to start a chat with technical support."
  },
  "زر مشاركة ونشر التطبيق كصدقة جارية": {
    "title": "Share App as Ongoing Charity Button",
    "purpose": "Share app link with your family and WhatsApp groups to earn continuous reward."
  },
  "زر إغلاق نافذة الواتساب (×)": {
    "title": "Close WhatsApp Modal Button (×)",
    "purpose": "Closes the contact window and returns to the previous view."
  },
  "زر بوصلة القبلة بالهيدر": {
    "title": "Header Qibla Compass Button",
    "purpose": "Navigates directly from Prayer Times to the Qibla Compass to determine the Kaaba direction instantly."
  },
  "زر فتح المصحف الشريف من المجتمع": {
    "title": "Open Quran from Community",
    "purpose": "Allows quick access to the Quran to recite verses or share directly in community discussions."
  },
  "شارة الملف الشخصي والدولة": {
    "title": "Profile & Country Badge",
    "purpose": "Displays your account name, avatar, and country flag. Tap to edit your profile details."
  },
  "مؤشر المدينة والموقع الجغرافي بالهيدر": {
    "title": "City & Location Indicator",
    "purpose": "Displays your current city, province, and country code. Tap to change city or update location via GPS."
  },
  "عنوان صفحة الاستماع للقرآن": {
    "title": "Quran Audio Player Page",
    "purpose": "Audio recitation page featuring renowned Islamic world reciters with verse repetition, sleep timer, and favorites."
  },
  "زر لوحة المتصدرين (الكأس)": {
    "title": "Leaderboard Trophy Button",
    "purpose": "Opens the honor leaderboard of top Quran readers and active community members for this month."
  },
  "زر إعدادات مواقيت الصلاة والأذان": {
    "title": "Prayer Times & Adhan Settings",
    "purpose": "Configure astronomical calculation methods, adhan reciters per prayer, prayer time calibration offsets, and iqama alerts."
  },
  "أيقونة معايرة البوصلة بالهيدر": {
    "title": "Compass Calibration Indicator",
    "purpose": "Checks sensor accuracy and guides you through figure-8 calibration movement if magnetic interference is detected."
  },
  "زر الانتقال للمصحف الشريف": {
    "title": "Jump to Quran Page",
    "purpose": "Takes you directly to the Noble Quran to read your daily wird and record read pages on the leaderboard."
  },
  "زر أدعية وأذكار": {
    "title": "Supplications & Adhkar Button",
    "purpose": "Access daily authentic supplications and dhikr."
  },
  "زر القائمة الجانبية": {
    "title": "Side Menu Button",
    "purpose": "Opens the full side menu with settings, themes, notifications, and features."
  },
  "زر الصفحة الرئيسية": {
    "title": "Home Page Button",
    "purpose": "Returns to the main home screen of the application."
  },
  "زر الفهرس السريع والتصنيفات": {
    "title": "Quick Index & Categories Button",
    "purpose": "Opens index and classification list for instant navigation."
  },
  "زر الفهرس السريع": {
    "title": "Quick Index Button",
    "purpose": "Jump to any section with a single tap."
  },
  "زر تكرار السورة": {
    "title": "Repeat Surah Button",
    "purpose": "Loops current Surah continuously."
  },
  "زر التشغيل المتواصل": {
    "title": "Continuous Play Button",
    "purpose": "Automatically plays the next Surah."
  },
  "شريط تقليب وتحديد التاريخ": {
    "title": "Date Navigator Bar",
    "purpose": "Navigate between previous and next dates."
  },
  "زر تنفيذ البحث": {
    "title": "Search Button",
    "purpose": "Executes instant search query."
  },
  "بطاقة الدعم الفني الفوري والرد على الاستفسارات": {
    "title": "Instant Technical Support Card",
    "purpose": "Channel to submit inquiries and receive prompt answers from moderators."
  },
  "خانة البحث عن مدينة أو دولة": {
    "title": "Search City or Country Field",
    "purpose": "Type any city or country in the world to calculate precise prayer times according to local coordinates."
  },
  "أول الليل": {
    "title": "First Part of the Night",
    "purpose": "Starts at Maghrib adhan and marks the initial portion of the Islamic night."
  },
  "إعدادات التكرار والسكتة والربط": {
    "title": "Repetition, Pause & Linking Settings",
    "purpose": "Adjust how many times each verse repeats and configure silence pauses to practice recitation."
  },
  "أيقونة التواصل والدعم الفني عبر واتساب (الشاشة الرئيسية)": {
    "title": "WhatsApp Support Icon (Home Screen)",
    "purpose": "Instant shortcut on the home screen to open direct WhatsApp conversation with app support."
  }
};

// Complete dictionary of UI strings for the Page Guide and Visual Mockups
export const MOCKUP_UI_STRINGS_EN: Record<string, string> = {
  "سنن الصلوات (الرواتب)": "Sunnah Prayers (Rawatib)",
  "اتجاه القبلة: 244°": "Qibla Direction: 244°",
  "اتجاه القبلة:": "Qibla Direction:",
  "بوصلة": "Compass",
  "قم بمحاذاة السهم الأسود مع علامة الشمال (ش)": "Align the black arrow with North mark (N)",
  "(يجب تفعيل الموقع للهاتف لحساب الموقع بدقة)": "(Phone location must be enabled for accurate calculation)",
  "ع.م": "A.M",
  "أدعية من القرآن الكريم • سورة البقرة: 127": "Quranic Supplications • Surah Al-Baqarah: 127",
  "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ": "Our Lord, accept this from us. Indeed You are the Hearing, the Knowing.",
  "بدء المؤقت": "Start Timer",
  "تشغيل متواصل (الانتقال للسورة التالية)": "Continuous Play (Next Surah)",
  "ملاحظة: لا تعمل هذه الصفحة إلا إذا كنت متصلاً بالإنترنت، ويفضل الواي فاي.": "Note: This page only works with an active internet connection, preferably Wi-Fi.",
  "المتسابق الثالث (عضو مجتهد)": "Contestant 3 (Active Member)",
  "المتسابق الثاني (محب القرآن)": "Contestant 2 (Quran Devotee)",
  "فاعل خير (قارئ للقرآن)": "Anonymous Benefactor (Quran Reciter)",
  "سُورَةُ ٱلْفَاتِحَةِ": "Surah Al-Fatihah",
  "مَكِّيَّةٌ": "Meccan",
  "١ - سورة الفاتحة - ايه ١ - جزء ١": "1 - Surah Al-Fatihah - Ayah 1 - Juz 1",
  "بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ": "[All] praise is [due] to Allah, Lord of the worlds -",
  "ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ": "The Entirely Merciful, the Especially Merciful,",
  "مَـٰلِكِ يَوْمِ ٱلدِّينِ": "Sovereign of the Day of Recompense.",
  "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ": "It is You we worship and You we ask for help.",
  "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ": "Guide us to the straight path -",
  "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ": "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
  "ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.": "Omitting a pillar invalidates the rite, omitting an obligation is compensated by sacrifice, and committing prohibitions requires ransom.",
  "عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: \"العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ\".": "Narrated Abu Huraira: The Messenger of Allah ﷺ said: 'Umrah to Umrah is an expiation for what is between them, and an accepted Hajj has no reward but Paradise.'",
  "ورد اليوم (١٥)": "Today's Wird (15)",
  "٢٨٢": "282",
  "٣٠٢": "302",
  "إعداد جلسة التحفيظ": "Memorization Session Setup",
  "سجل الحفظ والمراجعة": "Memorization & Revision Log",
  "عبد الباسط عبد الصمد (مرتل)": "Abdulbasit Abdulsamad (Murattal)",
  "٣ مرات": "3 times",
  "٥ مرات": "5 times",
  "آية الكرسي (سورة البقرة ٢٥٥)": "Ayat Al-Kursi (Surah Al-Baqarah 255)",
  "السنة النبوية": "Prophetic Sunnah",
  "المفضلة": "Favorites",
  "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...": "Allah! There is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep...",
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦)...": "Surah Al-Fatihah: In the Name of Allah, the Most Gracious, the Most Merciful. All praise is due to Allah, Lord of the worlds...",
  "الخط الزمني": "Timeline",
  "المرحلة المدنية": "Medinan Era",
  "المرحلة المكية": "Meccan Era",
  "انطلاق الهجرة الكبرى من مكة إلى المدينة المنورة وبداية التاريخ الهجري ومؤاخاة المهاجرين والأنصار.": "Commencement of the great Hijrah from Makkah to Madinah, the dawn of the Hijri era, and brotherhood between Muhajirun and Ansar.",
  "بدء النبوة": "Beginning of Prophethood",
  "شهر رمضان (٦١٠ م)": "Month of Ramadan (610 CE)",
  "مواقف خالدة": "Enduring Milestones",
  "مولد نبي الهدى محمد بن عبد الله بن عبد المطلب بمكة المكرمة في عام الفيل (٥٧١ م)، وإشراق نور النبوة على العالمين.": "Birth of Prophet Muhammad ibn Abdullah in Makkah in the Year of the Elephant (571 CE), shining guidance upon all worlds.",
  "نسبه الشريف ﷺ": "His Noble Lineage ﷺ",
  "هبوط أمين الوحي جبريل عليه السلام بالآيات الأولى من سورة العلق وتكليفه بالرسالة الخالدة رحمة للعالمين.": "Descent of Jibreel with the first verses of Surah Al-Alaq, commissioning him with the timeless message as a mercy to all creation.",
  "١ هـ (٦٢٢ م)": "1 AH (622 CE)",
  "البوابة العالمية لأصح إصدارات القرآن الكريم بالروايات المتواترة والترجمات المعتمدة لكافة لغات العالم.": "Global portal for authenticated Quran editions with multiple recitations and approved world translations.",
  "الدرر السنية (الموسوعة الحديثية)": "Dorar (Hadith Encyclopedia)",
  "المصاحف الرسمية": "Official Mushafs",
  "تخريج الحديث": "Hadith Verification",
  "محرك بحث متخصص يتيح البحث في كتب السنة النبوية وتخريج صحة وضعف الأحاديث بنقرة واحدة.": "Specialized search engine to explore Hadith collections and authenticate narrations in one click.",
  "«بينما نحن جلوس عند رسول الله ﷺ ذات يوم إذ طلع علينا رجل شديد بياض الثياب شديد سواد الشعر لا يُرى عليه أثر السفر...»": "While we were one day sitting with the Messenger of Allah ﷺ there appeared before us a man dressed in extremely white clothes and with very black hair, with no signs of travel on him...",
  "«سمعتُ رسولَ اللهِ ﷺ يقولُ: إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ...»": "I heard the Messenger of Allah ﷺ say: 'Actions are according to intentions, and everyone will get what was intended. Whoever migrated for Allah and His Messenger, his migration is for Allah and His Messenger...'",
  "الحديث الثاني: مراتب الدين (الإسلام والإيمان والإحسان)": "Hadith 2: Levels of Faith (Islam, Iman & Ihsan)",
  "رقم ١": "No. 1",
  "رقم ٢": "No. 2",
  "الديون المستحقة عليك (تخصم):": "Debts Owed by You (Deducted):",
  "الكفارات": "Expiations (Kaffarat)",
  "المواريث": "Inheritance",
  "النصاب الشرعي (٨٥ جرام ذهب)": "Sharia Nisab (85g Gold)",
  "حاسبة الزكاة": "Zakat Calculator",
  "فطر وأضحية": "Fitr & Udhiyah",
  "«اقرأ سورة البقرة»": "«Recite Surah Al-Baqarah»",
  "علاء أحمد": "Alaa Ahmed",
  "للتواصل والاقتراحات": "For Contact & Inquiries",

  "\"أذكار الصباح\"": "\"Morning Adhkar\"",
  "\"افتح السبحة\"": "\"Open Tasbeeh\"",
  "\"مواقيت الصلاة\"": "\"Prayer Times\"",
  "- ٢٠,٠٠٠ ج.م": "- 20,000 EGP",
  "آخر السورة": "End of Surah",
  "أبرز المناسبات هذا الشهر": "Key Events This Month",
  "أدعية وأذكار": "Supplications & Adhkar",
  "أكتوبر ٢٠٢٦": "October 2026",
  "أمثلة على الأوامر الصوتية:": "Voice Command Examples:",
  "أيقونة التحكم الصوتي": "Voice Control Icon",
  "أيقونة الواتساب في الشاشة الرئيسية": "WhatsApp Icon on Home Screen",
  "إبراهيم الأخضر": "Ibrahim Al-Akhdar",
  "إجمالي الزكاة الواجبة فوراً:": "Total Zakat Due Immediately:",
  "إحصائياتي": "My Statistics",
  "إضافة عبادة أو عادة شخصية جديدة": "Add New Custom Worship or Habit",
  "إظهار الأيقونة في الصفحة الرئيسية": "Show Icon on Home Screen",
  "إعادة ضبط": "Reset",
  "إعدادات التكرار الذكي": "Smart Repeat Settings",
  "إلى": "To",
  "إلى صفحة": "To Page",
  "إنجاز اليوم ٨٥٪": "Today's Progress 85%",
  "ابحث بالاسم أو المعنى...": "Search by Name or Meaning...",
  "ابحث في آيات وأدعية الرقية الشرعية...": "Search Ruqyah Ayahs & Duas...",
  "ابحث في الأحاديث النبوية وشروحها...": "Search Prophetic Hadiths & Explanations...",
  "ابحث في المواقع الإسلامية الموثوقة...": "Search Trusted Islamic Platforms...",
  "استماع للنطق والمعنى والأدلة القرآنية": "Listen to Pronunciation, Meaning & Quranic Proofs",
  "افتح المصحف للقراءة": "Open Quran for Recitation",
  "الأحد": "Sunday",
  "الأذكار والقرآن": "Adhkar & Quran",
  "الأربعاء": "Wednesday",
  "الأرشيف": "Archive",
  "الأموال والمدخرات المحسوبة": "Calculated Funds & Savings",
  "الإثنين": "Monday",
  "التالي": "Next",
  "التحكم الصوتي مفعل": "Voice Control Active",
  "الثلاثاء": "Tuesday",
  "الجامع لصفات الكمال": "Encompassing All Attributes of Perfection",
  "الجمعة": "Friday",
  "الخصوصية والظهور": "Privacy & Visibility",
  "الخميس": "Thursday",
  "الراحم بالمؤمنين": "The Especially Merciful to Believers",
  "الرَّحِيمُ": "Ar-Raheem (The Most Merciful)",
  "الرَّحْمَٰنُ": "Ar-Rahman (The Most Gracious)",
  "السابق": "Previous",
  "السبت": "Saturday",
  "السكتة:": "Pause (Saktah):",
  "السنة ✓": "Sunnah ✓",
  "السنن ✓": "Sunnahs ✓",
  "السيولة النقدية والودائع البنكية:": "Cash Liquidity & Bank Deposits:",
  "السَّلَامُ": "As-Salam (The Source of Peace)",
  "الشبكة": "Network",
  "الشمس وا...": "Ash-Shams...",
  "الشهر الحالي": "Current Month",
  "الصلوات المكتوبة والسنن": "Obligatory Prayers & Sunnahs",
  "الفريضة ✓": "Fard (Obligatory) ✓",
  "القارئ: إبراهيم الأخضر": "Reciter: Ibrahim Al-Akhdar",
  "المتبقي على صلاة": "Remaining until",
  "المتصرف في ملكه": "The Sovereign Ruler of Creation",
  "المحددة": "Selected",
  "المرئية": "Visible",
  "المركز 3": "Rank 3",
  "المفضلات المحفوظة": "Saved Favorites",
  "المنزه عن كل عيب": "Pure and Free of any Imperfection",
  "المواقيت الشهرية": "Monthly Prayer Times",
  "الهجرة النبوية المباركة": "Blessed Prophetic Migration (Hijrah)",
  "الواقع معزز": "Augmented Reality",
  "اليوم ١٥ من ٣٠": "Day 15 of 30",
  "اليوم • الأحد ١٦ ربيع الآخر ١٤٤٨ هـ": "Today • Sun 16 Rabi' al-Thani 1448 AH",
  "الْقُدُّوسُ": "Al-Quddus (The Most Holy)",
  "الْمَلِكُ": "Al-Malik (The King)",
  "انقر عليها لفتح نافذة التواصل الفوري": "Tap to open instant WhatsApp chat",
  "بدء جلسة التحفيظ والترديد": "Start Memorization & Repetition Session",
  "بقيت طاعات يسيرة لاكتمال يومك": "A few gentle deeds remain to fulfill your day",
  "تحميل المصحف": "Download Quran",
  "ترتيبك في جمادى الأولى 1448هـ:": "Your Rank in Jumada al-Awwal 1448 AH:",
  "تشغيل متواصل": "Continuous Play",
  "تعديل الختمة": "Edit Khatmah",
  "تكرار الآية:": "Ayah Repeat:",
  "تكرار السورة ✓": "Surah Repeat ✓",
  "تكرار النطاق:": "Range Repeat:",
  "تكرار نفس السورة بعد انتهائها": "Repeat the same Surah after it finishes",
  "تواصل عبر الواتساب": "Contact via WhatsApp",
  "ج": "Fri",
  "جمادى الأولى 8...": "Jumada al-Awwal 8...",
  "جمادى الأولى ١٤٤٨ هـ": "Jumada al-Awwal 1448 AH",
  "حل المشكلات والرد على استفسارات المستخدمين": "Troubleshooting & answering user inquiries",
  "دعم فني فوري واستجابة سريعة": "Instant Technical Support & Fast Response",
  "ربط الآيات:": "Ayah Linking:",
  "سورة الفاتحة : آية ١": "Surah Al-Fatihah : Ayah 1",
  "سورة الفاتحة : آية ٧": "Surah Al-Fatihah : Ayah 7",
  "ش": "N",
  "صفحة واحدة": "One Page",
  "صلاة الظهر:": "Dhuhr Prayer:",
  "صلاة العشاء:": "Isha Prayer:",
  "صلاة العصر:": "Asr Prayer:",
  "صلاة الفجر:": "Fajr Prayer:",
  "صلاة المغرب:": "Maghrib Prayer:",
  "عرض التقويم": "View Calendar",
  "عرض الفوائد والشرح": "View Benefits & Explanation",
  "عروض التجارة والبضائع:": "Trade Goods & Merchandise:",
  "عمره الشريف: ٠ سنة": "His Age: 0 years",
  "عمره الشريف: ٤٠ سنة": "His Age: 40 years",
  "عمره الشريف: ٥٣ سنة": "His Age: 53 years",
  "عن أمير المؤمنين عمر بن الخطاب رضي الله عنه": "On the authority of Amir al-Mu'minin Umar ibn al-Khattab (RA)",
  "عَدّاد الطواف": "Tawaf Counter",
  "غ": "W",
  "فضل الحج والعمرة": "Virtues of Hajj & Umrah",
  "ق": "E",
  "قائمة التجهيزات والأمتعة": "Checklist & Luggage Packing",
  "قيمة النصاب": "Nisab Value",
  "لا توجد مناسبات مسجلة": "No events scheduled",
  "ليس لها سنة راتبة": "No regular confirmed Sunnah",
  "مؤقت النوم": "Sleep Timer",
  "متسابق": "Reciter / Contestant",
  "متوقف": "Paused",
  "مجهول": "Anonymous",
  "مفعل": "Enabled",
  "من": "From",
  "من صفحة": "From Page",
  "منجز 🔥 ٥ أيام": "Completed 🔥 5 Days",
  "منجز 🔥 ٧ أيام": "Completed 🔥 7 Days",
  "مولد الحبيب المصطفى ﷺ": "Birth of the Beloved Prophet ﷺ",
  "نزول الوحي في غار حراء": "Revelation in the Cave of Hira",
  "نسبة الإنجاز": "Completion Rate",
  "نشط 🟢": "Active 🟢",
  "نطاق الآيات المراد حفظها": "Range of Ayahs to Memorize",
  "واسع الرحمة بخلقه": "Vast in Mercy to all Creation",
  "واهب الأمن والسلام": "Bestower of Peace and Security",
  "ورد القرآن الكريم اليومي": "Daily Quran Wird",
  "يفتح أذكار الصباح": "Opens Morning Adhkar",
  "يفتح السبحة الإلكترونية": "Opens Electronic Tasbeeh",
  "يفتح مواقيت الصلاة والأذان": "Opens Prayer Times & Azan",
  "يمكنك التحدث بالأوامر من أي مكان في التطبيق": "You can speak commands from anywhere in the app",
  "٠١:٠١": "01:01",
  "١ ثانية": "1 sec",
  "١٢ ربيع الأول عام الفيل": "12 Rabi' al-Awwal, Year of the Elephant",
  "١٥ يوماً مكتملاً": "15 days completed",
  "٢٧٢,٠٠٠ ج.م": "272,000 EGP",
  "٢٨": "28",
  "٢٣ مرات": "23 times",
  "٣,٢٠٠ ج.م / جرام": "3,200 EGP / gram",
  "٣٠٠,٠٠٠ ج.م": "300,000 EGP",
  "٣٠": "30",
  "٢٥ مرات": "25 times",
  "٥٠,٠٠٠ ج.م": "50,000 EGP",
  "٨,٢٥٠ ج.م": "8,250 EGP",
  "▪ 1 صفحة مسجلة": "▪ 1 page recorded",
  "▪ 13 صفحة مسجلة": "▪ 13 pages recorded",
  "▪ 6 صفحات مسجلة": "▪ 6 pages recorded",
  "🇪🇬 مصر": "🇪🇬 Egypt",
  "🌐 عضو مميز": "🌐 Featured Member",
  "📍 المدينة المنورة": "📍 Al-Madinah Al-Munawwarah",
  "📍 غار حراء • جبل النور": "📍 Cave of Hira • Jabal An-Nur",
  "📍 مكة المكرمة": "📍 Makkah Al-Mukarramah",

  "لبس النقاب والقفازين للمرأة.": "Wearing niqab and gloves for women.",
  "عقد النكاح أو الخطبة.": "Concluding marriage contract or proposal.",
  "الجماع ومقدماته.": "Marital relations and its preludes.",
  "صيد البر.": "Hunting game animals.",
  "ذو الحليفة (لأهل المدينة).": "Dhul Hulaifah (for people of Medina).",
  "الجحفة (لأهل الشام ومصر والمغرب).": "Al-Juhfah (for people of the Levant, Egypt & Maghreb).",
  "قرن المنازل (لأهل نجد).": "Qarn al-Manazil (for people of Najd).",
  "يلملم (لأهل اليمن).": "Yalamlam (for people of Yemen).",
  "ذات عرق (لأهل العراق).": "Dhat Irq (for people of Iraq).",
  "ما الفرق بين الحج والعمرة؟": "What is the difference between Hajj and Umrah?",
  "الحج ركن من أركان الإسلام، أما العمرة فواجبة مرة في العمر على القول الراجح.": "Hajj is a fundamental pillar of Islam, while Umrah is obligatory once in a lifetime according to the soundest opinion.",
  "الحج له وقت محدد (أشهر الحج)، بينما العمرة متاحة طوال العام.": "Hajj has designated months, while Umrah can be performed year-round.",
  "أعمال الحج أكبر وتشمل الوقوف بعرفة والمبيت بمنى ومزدلفة ورمي الجمار.": "Hajj rites are extensive, including standing at Arafat, overnight stay at Mina and Muzdalifah, and stoning the Jamarat.",
  "صلاة الفجر": "Fajr Prayer",
  "صلاة الظهر": "Dhuhr Prayer",
  "صلاة العصر": "Asr Prayer",
  "صلاة المغرب": "Maghrib Prayer",
  "صلاة العشاء": "Isha Prayer",
  "أذكار وتسابيح ما بعد صلاة الصبح وسنة الفجر.": "Adhkar and praises after Morning prayer and Fajr Sunnah.",
  "أذكار ما بعد صلاة الظهر والاستغفار المأثور.": "Adhkar after Dhuhr prayer and authentic seeking of forgiveness.",
  "أذكار ما بعد صلاة العصر حتى الغروب.": "Adhkar after Asr prayer until sunset.",
  "أذكار ما بعد صلاة المغرب ودعاء الإفطار.": "Adhkar after Maghrib prayer and fasting break supplication.",
  "أذكار ما بعد صلاة العشاء والوتر وقيام الليل.": "Adhkar after Isha prayer, Witr and Qiyam al-Layl.",
  "أذكار الاستيقاظ من النوم": "Adhkar of Waking Up",
  "دعاء لبس الثوب": "Supplication for Wearing a Garment",
  "دعاء لبس الثوب الجديد": "Supplication for Wearing a New Garment",
  "الدعاء لمن لبس ثوبا جديدا": "Supplication for Someone Wearing a New Garment",
  "ما يقول إذا وضع ثوبه": "What to Say When Taking Off Clothes",
  "دعاء دخول الخلاء": "Supplication for Entering the Restroom",
  "دعاء الخروج من الخلاء": "Supplication for Leaving the Restroom",
  "الذكر قبل الوضوء": "Remembrance Before Ablution",
  "الذكر بعد الفراغ من الوضوء": "Remembrance After Completing Ablution",
  "الذكر عند الخروج من المنزل": "Remembrance When Leaving the House",
  "أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.": "We have entered a new morning and with it all sovereignty belongs to Allah. Praise be to Allah; there is no deity except Allah alone without partner, to Him belongs dominion and praise, and He is over all things competent.",
  "اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.": "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection.",
  "اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.": "O Allah, whatever blessing has reached me or anyone of Your creation in this morning is from You alone, without partner; to You belongs praise and thanks.",
  "من أذكار الصباح المأثورة": "From Authentic Morning Adhkar",
  "(يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)": "(Location must be enabled on phone to calculate accurately)",
  "٢٠,٠٠٠ ج.م": "20,000 EGP",
  "...عن مدينة أو محافظة": "Search city or province...",
  "1 - الفاتحة": "1 - Al-Faatiha",
  "13 صفحة": "13 pages",
  "15 دقيقة": "15 min",
  "2 ركعة بعدية": "2 Sunnah Rak'ahs after",
  "2 ركعة قبلية": "2 Sunnah Rak'ahs before",
  "30 دقيقة": "30 min",
  "4 قبلية و 2 بعدية": "4 Rak'ahs before & 2 after",
  "6 صفحات": "6 pages",
  "60 دقيقة": "60 min",
  "قراءة": "Read",
  "استماع": "Listen",
  "تحفيظ": "Memorize",
  "تفسير": "Tafseer",
  "تكرار": "Repeat",
  "المصحف": "Mushaf",
  "القارئ": "Reciter",
  "السورة": "Surah",
  "الجزء": "Juz",
  "الحزب": "Hizb",
  "الآية": "Verse",
  "بحث": "Search",
  "مفضلة": "Favorite",
  "مشاركه": "Share",
  "مشاركة": "Share",
  "نسخ": "Copy",
  "تكبير": "Zoom In",
  "تصغير": "Zoom Out",
  "تحديث": "Refresh",
  "إلغاء": "Cancel",
  "حفظ": "Save",
  "تم": "Done",
  "الرئيسية": "Home",
  "الإعدادات": "Settings",
  "الثيمات": "Themes",
  "الإشعارات": "Notifications",
  "نوع الخط": "Font Type",
  "آيات السجدة": "Sajdah Verses",
  "تواصل معنا": "Contact Us",
  "البحث المتقدم": "Advanced Search",
  "أهل القرآن (لوحة الشرف)": "Ahl Al-Qur'an (Honor Board)",
  "شرح وافٍ ومبسط لجميع خدمات وصفحات ومميزات التطبيق.": "Comprehensive and clear guide for all app services, pages, and features.",
  "التواصل والمحادثات مع القراء والحفاظ من جميع أنحاء العالم.": "Communication and discussions with Quran readers and memorizers worldwide.",
  "لوحة صدارة وتنافس محمود لقراء القرآن الكريم مع تحديث شهري للأجزاء والختمات.": "Leaderboard and righteous competition for Quran readers with monthly updates of portions and completions.",
  "خط زمني تفاعلي لمحطات السيرة العطرة والعبر المستفادة.": "Interactive timeline of the fragrant Prophetic biography and lessons.",
  "البحث عن آية، أو دعاء، أو أذكار.": "Search for a verse, supplication, or remembrance.",
  "متابعة الصلاة وتلاوة القرآن والأذكار والأهداف اليومية.": "Track prayer, Quran recitation, adhkar, and daily goals.",
  "العودة إلى الشاشة الرئيسية للتطبيق.": "Return to the main home screen of the application.",
  "يقوم بعرض النص القرآني والتلاوة والتفسير والترجمة.": "Displays Quranic text, audio recitation, Tafseer, and translation.",
  "الاستماع إلى تلاوات كبار القراء بمختلف الروايات.": "Listen to recitations of prominent reciters in various Riwayat.",
  "عرض مواقيت الصلاة واتجاه القبلة لموقعك الحالي.": "View prayer times and Qibla direction for your current location.",
  "متابعة وردك اليومي من القرآن والأذكار.": "Follow your daily portion of Quran and daily adhkar.",
  "أدوات مساعدة لحفظ ومراجعة القرآن الكريم.": "Helpful tools for memorizing and reviewing the Holy Quran.",
  "التحكم في التطبيق من خلال الأوامر الصوتية.": "Control the app using hands-free voice commands.",
  "اختر قارئك المفضل للاستماع إلى التلاوة العطرة.": "Choose your preferred reciter to listen to fragrant recitation.",
  "تغيير نوع الخط بما يناسب راحتك في القراءة.": "Change font type according to your reading comfort.",
  "يمكنك الوصول الى اشعارات التطبيق واشعارات الهاتف والتعديل عليها بما يناسبك": "Access and customize in-app and device notifications as you prefer.",
  "قائمة بجميع مواضع السجدات في القرآن الكريم للوصول السريع.": "Directory of all prostration (Sajdah) locations in the Quran for quick access.",
  "التحكم الكامل بالتطبيق من داخل هذا الزر": "Complete control of the app from within this button.",
  "تغيير ألوان ومظهر التطبيق بالكامل.": "Change app theme colors and overall appearance.",
  "تواصل مباشر معنا للاقتراحات أو الدعم الفني.": "Direct communication with us for suggestions or technical support.",
  "جديد": "New",
  "تنبيه هام": "Important Jurisprudential Notice",
  "تنبيه فقهي": "Fiqh Notice",
  "نصاب الزكاة": "Zakat Nisab",
  "المبلغ المستحق": "Due Amount",
  "المقدار الواجب": "Amount Due",
  "إجمالي الذهب": "Total Gold",
  "إجمالي المدخرات": "Total Savings",
  "قيمة الديون": "Debts Value",
  "الأقمار الصناعية": "Satellite View",
  "الاتجاه الدقيق": "Precise Bearing",
  "الدرجة": "Degree",
  "القبلة نحو مكة": "Qibla towards Makkah",
  "المسافة إلى مكة": "Distance to Makkah",
  "كيلومتر": "km",
  "كم": "km",
  "صوت الأذان": "Adhan Sound",
  "تنبيه الإقامة": "Iqama Alert",
  "طريقة الحساب": "Calculation Method",
  "رابطة العالم الإسلامي": "Muslim World League",
  "أم القرى - مكة": "Umm Al-Qura - Makkah",
  "الهيئة المصرية العامة للمساحة": "Egyptian General Authority of Survey",
  "جامعة العلوم الإسلامية بكراتشي": "University of Islamic Sciences, Karachi",
  "الاتحاد الإسلامي لأمريكا الشمالية": "ISNA (Islamic Society of North America)",

  "مصحف أحمد وليلى": "Mushaf Ahmed & Laila",
  "شرح كامل لجميع صفحات التطبيق": "Comprehensive Guide for All App Pages",
  "مصمم التطبيق : علاء احمد المرشدى": "App Developer: Alaa Ahmed Al-Morshedy",
  "دليل صفحات التطبيق": "App Pages Guide",
  "العودة لقائمة الصفحات": "Back to Pages List",
  "رجوع للخلف": "Back",
  "الصفحة الرئيسية": "Home Page",
  "شرح أيقونة مجتمع التواصل": "Faith Community Guide",
  "شرح أيقونة الواتساب": "WhatsApp Contact Guide",
  "شرح أيقونة التحكم الصوتي": "Voice Control Guide",
  "شرح أيقونة أهل القرآن": "Ahl Al-Qur'an Guide",
  "تواصل واتساب": "WhatsApp Contact",
  "التحكم الصوتي": "Voice Control",
  "لوحة المتصدرين": "Leaderboard",
  "مجتمع التواصل": "Faith Community",
  "القرآن الكريم": "The Noble Qur'an",
  "الاستماع للقرآن": "Listen to Qur'an",
  "مواقيت الصلاة": "Prayer Times",
  "القبلة": "Qibla Direction",
  "أذكار الصلاة": "Salah Adhkar",
  "الأدعية": "Supplications",
  "حصن المسلم": "Hisn Al-Muslim",
  "الأذكار": "Daily Adhkar",
  "التقويم": "Islamic Calendar",
  "الحج والعمرة": "Hajj & Umrah",
  "السبحة": "Electronic Tasbeeh",
  "السبحة الإلكترونية": "Electronic Tasbeeh",
  "أهل القرآن": "Ahl Al-Qur'an",
  "أهل القرآن الكريم": "Ahl Al-Qur'an",
  "الورد اليومي": "Daily Wird",
  "التحفيظ": "Memorization",
  "التحفيظ والمراجعة": "Memorization & Review",
  "مربّي العبادات": "Habit Tracker",
  "الرقية الشرعية": "Ruqyah Shariah",
  "مواقع إسلامية": "Islamic Sites",
  "الحاسبة الشرعية": "Calculators",
  "الأربعون النووية": "Forty Hadith",
  "أسماء الله الحسنى": "Names of Allah",
  "السيرة النبوية": "Prophetic Seerah",
  "الوظيفة الأساسية": "Primary Function",
  "نقرة واحدة": "Single Tap",
  "الضغط المطول": "Long Press",
  "إغلاق": "Close",
  "سبحان الله": "Subhan Allah (Glory be to Allah)",
  "إضافة": "Add",
  "حذف": "Delete",
  "لون العداد": "Color",
  "شكل العداد": "Style",
  "الرسم البياني": "Analytics",
  "الهدف:": "Target:",
  "٣٣": "33",
  "اضغط للعد": "Tap to Count",
  "تعديل الهدف": "Edit Target",
  "تصفير": "Reset",
  "تصفير العداد": "Reset Counter",
  "الرسم البياني وتطور التسبيح أسبوعي وشهري": "Weekly & Monthly Progress Chart",
  "الأصدقاء": "Friends",
  "المجتمع": "Community",
  "الأعضاء": "Members",
  "الحظر": "Blocked",
  "ابحث عن أصدقاء وقُرّاء بالاسم أو الدولة أو...": "Search friends & reciters by name, country...",
  "الدعم الفني": "Support",
  "(الإدارة 🛡️)": "(Admin 🛡️)",
  "تواصل مع إدارة التطبيق للدعم الفنى والشكاوى...": "Contact app administration for support and inquiries...",
  "٠٣:٠٠ م": "03:00 PM",
  "أحمد علي": "Ahmed Ali",
  "(عضو متفاعل 🌐)": "(Active Member 🌐)",
  "السلام عليكم ورحمة الله وبركاته": "Assalamu Alaikum wa Rahmatullahi wa Barakatuh",
  "١١:٠٨ م": "11:08 PM",
  "مستخدم المصحف": "Mushaf User",
  "ابحث في الأدعية...": "Search supplications...",
  "يُقرأ مرة واحدة": "Recited Once",
  "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ": "Our Lord, give us in this world that which is good and in the Hereafter that which is good and protect us from the punishment of the Fire.",
  "أدعية من القرآن الكريم • سورة البقرة: 201": "Quranic Supplications • Surah Al-Baqarah: 201",
  "الفهرس السريع لأذكار الصلاة": "Quick Index for Prayer Adhkar",
  "بعد السلام من الصلاة المفروضة": "After the final Salam of the obligatory prayer",
  "أستغفر الله، أستغفر الله، أستغفر الله، اللهم أنت السلام ومنك السلام، تباركت يا ذا الجلال والإكرام": "I ask Allah for forgiveness (three times). O Allah, You are Peace and from You is peace; blessed are You, Possessor of Majesty and Honor.",
  "سنن الصلوات الرواتب اليومية": "Daily Sunnah Rawatib Prayers",
  "سنن الصلوات الرواتب اليومية (١٢ ركعة)": "Daily Sunnah Rawatib Prayers (12 Rak'ahs)",
  "ابحث في حصن المسلم...": "Search Fortress of the Muslim...",
  "أذكار الصباح والمساء": "Morning & Evening Adhkar",
  "أذكار النوم والأحلام": "Sleep & Dreams Adhkar",
  "دعاء الاستفتاح في الصلاة": "Opening Supplication in Prayer",
  "أذكار الركوع والسجود": "Ruku & Sujud Adhkar",
  "أذكار بعد السلام من الصلاة": "Post-Prayer Adhkar",
  "دعاء صلاة الاستخارة": "Istikharah Prayer Supplication",
  "أذكار الأذان والإقامة": "Adhan & Iqamah Adhkar",
  "أذكار دخول وخروج المسجد": "Entering & Leaving Mosque Adhkar",
  "التقويم الهجري": "Hijri Calendar",
  "محول التاريخ": "Date Converter",
  "شعبان ١٤٤٧ هـ": "Sha'ban 1447 AH",
  "فبراير ٢٠٢٦ م": "February 2026 CE",
  "أحد": "Sun",
  "اثنين": "Mon",
  "ثلاثاء": "Tue",
  "أربعاء": "Wed",
  "خميس": "Thu",
  "جمعة": "Fri",
  "سبت": "Sat",
  "أبرز المناسبات الإسلامية القادمة": "Upcoming Major Islamic Events",
  "غرة شهر رمضان المبارك": "First Day of Ramadan",
  "١ رمضان ١٤٤٧ هـ": "1 Ramadan 1447 AH",
  "أذكار الصباح": "Morning Adhkar",
  "أذكار المساء": "Evening Adhkar",
  "أذكار النوم": "Sleep Adhkar",
  "أذكار الاستيقاظ": "Waking Up Adhkar",
  "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ": "We have entered a new morning and with it all sovereignty belongs to Allah. Praise be to Allah; there is no deity except Allah alone without partner.",
  "الصلاة القادمة: الظهر": "Next Prayer: Dhuhr",
  "متبقي حتى أذان الظهر": "Time remaining until Dhuhr",
  "الفجر": "Fajr",
  "الشروق": "Sunrise",
  "الظهر": "Dhuhr",
  "العصر": "Asr",
  "المغرب": "Maghrib",
  "العشاء": "Isha",
  "منتصف الليل": "Midnight",
  "الثلث الأخير": "Last Third",
  "جدول مواقيت الشهر بالكامل": "Full Monthly Prayer Times Schedule",
  "المساجد القريبة": "Nearby Mosques",
  "Dammam - Eastern Province": "Dammam - Eastern Province",
  "Saudi Arabia": "Saudi Arabia",
  "٠٤:٥٢ ص": "04:52 AM",
  "٠٦:١١ ص": "06:11 AM",
  "١١:٥٦ ص": "11:56 AM",
  "٠٣:١٨ م": "03:18 PM",
  "٠٥:٤١ م": "05:41 PM",
  "٠٧:١١ م": "07:11 PM",
  "١١:٤٦ م": "11:46 PM",
  "٠٢:١٩ ص": "02:19 AM",
  "244° جنوب غرب": "244° South-West",
  "دقة البوصلة: ممتازة": "Compass Accuracy: Excellent",
  "البوصلة المغناطيسية": "Magnetic Compass",
  "الخريطة الجغرافية": "Satellite Map",
  "اتجاه القبلة نحو الكعبة المشرفة": "Qibla Direction towards Kaaba",
  "مشاري راشد العفاسي": "Mishary Rashid Al-Afasy",
  "رواية حفص عن عاصم": "Hafs from Asim",
  "سورة الفاتحة": "Surah Al-Faatiha",
  "سورة البقرة": "Surah Al-Baqarah",
  "سورة آل عمران": "Surah Aal-i-Imraan",
  "سورة النساء": "Surah An-Nisaa",
  "سورة الكهف": "Surah Al-Kahf",
  "سورة مريم": "Surah Maryam",
  "سورة يوسف": "Surah Yusuf",
  "سورة يس": "Surah Ya-Seen",
  "سورة الرحمن": "Surah Ar-Rahmaan",
  "سورة الواقعة": "Surah Al-Waqi'a",
  "سورة الملك": "Surah Al-Mulk",
  "مؤقت النوم الذكي": "Smart Sleep Timer",
  "التشغيل المتواصل": "Continuous Play",
  "تكرار السورة": "Repeat Surah",
  "قائمة المفضلات": "Favorites",
  "تحميل السورة": "Download",
  "١٥ دقيقة": "15 min",
  "٣٠ دقيقة": "30 min",
  "٦٠ دقيقة": "60 min",
  "نهاية السورة": "End of Surah",
  "تشغيل": "Play",
  "إيقاف": "Pause",
  "لوحة شرف أهل القرآن": "Ahl Al-Qur'an Honor Board",
  "المتصدر بالمركز الأول": "1st Place Leader",
  "المتصدر بالمركز الثاني": "2nd Place Leader",
  "المتصدر بالمركز الثالث": "3rd Place Leader",
  "ترتيبك الشهري الحالي": "Your Current Monthly Rank",
  "عدد الصفحات المقروءة": "Pages Read",
  "عدد الختمات": "Completed Khatmahs",
  "سجل وردك اليومي الآن": "Log Today's Wird",
  "الشهري": "Monthly",
  "التراكمي": "All-Time",
  "سجل القراءة": "Reading Log",
  "الصفحة": "Page",
  "ختمات": "Khatmahs",
  "صفحة": "pages",
  "مكية": "Meccan",
  "مدنية": "Medinan",
  "٧ آيات": "7 Verses",
  "الصفحة ١": "Page 1",
  "الجزء ١": "Juz 1",
  "الحزب ١": "Hizb 1",
  "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
  "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ": "All praise is due to Allah, Lord of the worlds.",
  "الرَّحْمَٰنِ الرَّحِيمِ": "The Entirely Merciful, the Especially Merciful.",
  "مَالِكِ يَوْمِ الدِّينِ": "Sovereign of the Day of Recompense.",
  "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ": "It is You we worship and You we ask for help.",
  "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ": "Guide us to the straight path.",
  "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ": "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
  "النص القرآني": "Quranic Text",
  "رقم الآية": "Verse Number",
  "اسم السورة": "Surah Name",
  "رقم الصفحة": "Page Number",
  "دليل العمرة": "Umrah Guide",
  "دليل الحج": "Hajj Guide",
  "محظورات الإحرام": "Ihram Prohibitions",
  "أدعية الطواف والسعي": "Tawaf & Sa'i Supplications",
  "عَدّاد أشواط الطواف": "Tawaf Circuit Counter",
  "الشوط الحالي: ٣ من ٧": "Current Circuit: 3 of 7",
  "تكبير عند محاذاة الحجر الأسود": "Takbeer when aligning with the Black Stone",
  "أشواط الطواف": "Tawaf Circuits",
  "أشواط السعي": "Sa'i Circuits",
  "قائمة الأمتعة والتجهيزات": "Luggage & Essentials Checklist",
  "المواقيت المكانية": "Miqat Locations",
  "الورد القرآني اليومي": "Daily Quranic Wird",
  "الورد اليومي الحالي: ٤ صفحات يومياً": "Current Daily Wird: 4 pages daily",
  "نسبة الإنجاز اليوم:": "Today's Progress:",
  "من الصفحة ٤٥ إلى الصفحة ٤٨": "From Page 45 to Page 48",
  "تمت قراءة ورد اليوم بنجاح": "Today's Wird Read Successfully",
  "تعديل إعدادات الورد والختمة": "Edit Wird & Khatmah Settings",
  "إعادة ضبط الختمة": "Reset Khatmah",
  "تمت القراءة": "Mark as Read",
  "جلسة التحفيظ والترديد المكرر": "Repetition & Memorization Session",
  "سورة النبأ (الآيات ١ - ١٥)": "Surah An-Naba (Verses 1 - 15)",
  "عدد مرات التكرار المحددة: ٥ مرات": "Configured Repetitions: 5 times",
  "القارئ المعلم: الشيخ محمود خليل الحصري": "Teaching Reciter: Sheikh Mahmoud Khalil Al-Husary",
  "ابدأ جلسة التحفيظ والترديد الآن": "Start Memorization Session Now",
  "من الآية": "From Verse",
  "إلى الآية": "To Verse",
  "عدد التكرارات": "Repetitions",
  "مربّي العبادات والسنن اليومية": "Daily Worship & Habits Tracker",
  "نسبة إنجاز اليوم: ٨٥٪": "Today's Progress: 85%",
  "الصلوات الخمس في أوقاتها": "Five Daily Prayers on Time",
  "ورد تلاوة القرآن الكريم": "Daily Quran Recitation",
  "صلاة الضحى": "Duha Prayer",
  "قيام الليل والوتر": "Qiyam Al-Layl & Witr",
  "صيام التطوع (الإثنين والخميس)": "Voluntary Fasting (Mon & Thu)",
  "إضافة عبادة أو عادة مخصصة": "Add Custom Worship Habit",
  "إضافة عبادة": "Add Habit",
  "أمس": "Yesterday",
  "اليوم": "Today",
  "الرقية الشرعية الكاملة من الكتاب والسنة": "Comprehensive Ruqyah Shariah from Quran & Sunnah",
  "آيات الرقية والشفاء والسكينة": "Healing & Protection Verses",
  "أدعية الرقية النبوية المأثورة": "Prophetic Ruqyah Supplications",
  "إرشادات وكيفية الرقية الشرعية الصحيحة": "Guidelines for Authentic Ruqyah",
  "آية الكرسي": "Ayat Al-Kursi",
  "سورة الإخلاص والمعوذتين": "Al-Ikhlas & Al-Mu'awwidhatayn",
  "الفاتحة (السبع المثاني والشافية)": "Al-Fatihah (The Cure)",
  "الخط الزمني للسيرة النبوية الشريفة": "Timeline of the Prophetic Seerah",
  "المعلم الأول: مولد النبي المصطفى ﷺ": "Milestone 1: Birth of Prophet Muhammad ﷺ",
  "المعلم الثاني: نزول الوحي الشريف وبدء البعثة": "Milestone 2: Descent of Revelation & Prophethood",
  "المعلم الثالث: الهجرة النبوية الشريفة إلى المدينة": "Milestone 3: Prophetic Hijrah to Medina",
  "غزوة بدر الكبرى (يوم الفرقان)": "Battle of Badr (Day of Criterion)",
  "فتح مكة المكرمة ودخول الناس في دين الله": "Conquest of Makkah",
  "حجة الوداع ووفاة الحبيب المصطفى ﷺ": "Farewell Pilgrimage & Passing of Prophet ﷺ",
  "العبرة والدرس المستفاد": "Key Lesson & Moral",
  "دليل المنصات والمواقع الإسلامية الموثوقة": "Directory of Trusted Islamic Platforms",
  "مجمع الملك فهد لطباعة المصحف الشريف": "King Fahd Complex for Printing Holy Quran",
  "موقع الدرر السنية (الموسوعة الحديثية والعقدية)": "Dorar Al-Saniyyah (Hadith Encyclopedia)",
  "موقع إسلام ويب (فتاوى وبحوث شرعية)": "IslamWeb (Fatwas & Islamic Research)",
  "موقع طريق الإسلام (صوتيات وتلاوات ودروس)": "IslamWay (Audio & Lectures)",
  "المكتبة الوقفية للكتب والرسائل العلمية": "Waqfeya Digital Library",
  "زيارة الموقع": "Visit Site",
  "الأربعون النووية للإمام النووي رحمه الله": "The Forty Hadith of Imam An-Nawawi",
  "الحديث الأول: إنما الأعمال بالنيات": "Hadith 1: Actions are by Intentions",
  "الحديث الثاني: حديث جبريل عليه السلام": "Hadith 2: Hadith of Jibreel",
  "شرح الحديث والفوائد المستنبطة": "Hadith Explanation & Key Benefits",
  "عن أمير المؤمنين أبي حفص عمر بن الخطاب رضي الله عنه": "Narrated by the Commander of the Faithful, Umar ibn al-Khattab (RA)",
  "شرح": "Explanation",
  "الحاسبة الشرعية وحساب الزكاة والمواريث": "Islamic Calculators & Inheritance",
  "زكاة الأموال النقدية والمدخرات": "Zakat on Cash & Savings",
  "زكاة الذهب والفضة والسبائك": "Zakat on Gold & Silver",
  "زكاة الفطر والأضحية والكفارات": "Zakat Al-Fitr, Udhiyah & Kaffarah",
  "حاسبة المواريث الشرعية وتقسيم التركات": "Islamic Inheritance & Estate Calculator",
  "نصاب الزكاة الحالي وسعر جرام الذهب": "Current Zakat Nisab & Gold Price",
  "احسب الزكاة الواجبة الآن": "Calculate Due Zakat Now",
  "المبلغ الإجمالي بالعملة المحلية": "Total Amount in Local Currency",
  "سعر جرام الذهب عيار 24": "Price of 24K Gold per Gram",
  "الديون والالتزامات المستحقة": "Deductible Debts & Liabilities",
  "المبلغ الواجب إخراجه": "Zakat Payable (2.5%)",
  "التحكم الصوتي الذكي في خدمات التطبيق": "Smart Voice Control for App Services",
  "اضغط على الميكروفون وتحدث بأمر صوتي مباشر": "Tap the microphone and speak your voice command",
  "أمثلة لأوامر صوتية مدعومة:": "Supported voice command examples:",
  "«افتح سورة الكهف»": "'Open Surah Al-Kahf'",
  "«شغل أذكار الصباح»": "'Play Morning Adhkar'",
  "«كم باقي على أذان العصر؟»": "'How much time remaining until Asr?'",
  "«افتح السبحة الإلكترونية»": "'Open Electronic Tasbeeh'",
  "«اقرأ ورد اليوم»": "'Read Today's Wird'",
  "افتح سورة الكهف": "Open Surah Al-Kahf",
  "شغل أذكار الصباح": "Play Morning Adhkar",
  "كم باقي على صلاة العصر؟": "How much time until Asr?",
  "افتح السبحة": "Open Tasbeeh",
  "اقرأ ورد اليوم": "Read Today's Wird",
  "جاري الاستماع...": "Listening...",
  "تحدث الآن": "Speak Now",
  "أسماء الله الحسنى ومعانيها الجليلة": "The Beautiful Names of Allah & Their Meanings",
  "«اللَّه»": "'Allah'",
  "«الرَّحْمَٰن»": "'Ar-Rahman'",
  "«الرَّحِيم»": "'Ar-Raheem'",
  "«الْمَلِك»": "'Al-Malik'",
  "«الْقُدُّوس»": "'Al-Quddus'",
  "«السَّلَام»": "'As-Salam'",
  "اللَّه": "Allah",
  "الرَّحْمَٰن": "Ar-Rahman",
  "الرَّحِيم": "Ar-Raheem",
  "الْمَلِك": "Al-Malik",
  "الْقُدُّوس": "Al-Quddus",
  "السَّلَام": "As-Salam",
  "الإله الحق المألوه المستحق للعبادة وحده": "The One True God Worthy of All Worship Alone",
  "ذو الرحمة الشاملة لجميع الخلائق في الدنيا والآخرة": "The Entirely Merciful to All Creation",
  "ذو الرحمة الخاصة بعباده المؤمنين": "The Especially Merciful to Believers",
  "صاحب الملك والتصرف المطلق في الكون": "The Absolute King & Sovereign",
  "المنزه عن كل نقص وعيب": "The Absolutely Pure from All Imperfection",
  "السالم من كل نقص والواهب للأمن والسلام": "The Source of Peace & Safety",
  "التواصل المباشر مع إدارة ومطور التطبيق": "Direct Contact with Developer & Support",
  "تواصل معنا عبر واتساب للملاحظات والاقتراحات": "Contact us on WhatsApp for feedback & suggestions",
  "محادثة مباشرة": "Direct WhatsApp Chat",
  "رقم الهاتف": "Phone Number",
  "مشاركة التطبيق كصدقة جارية": "Share App as Ongoing Charity",
  "نشر التطبيق كصدقة جارية": "Share App as Ongoing Charity",
  "مشاركة رابط التطبيق مع أحبائك في مجموعات الواتساب": "Share the app link with loved ones in WhatsApp groups"
};

// Helper to convert Arabic-Indic numerals (٠-٩) to Latin (0-9)
export const convertArabicDigitsToEnglish = (text: string): string => {
  const digits: Record<string, string> = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return text.replace(/[٠-٩]/g, (d) => digits[d] || d);
};

// Translate any UI string to English
export const tGuide = (text: string, language: string = 'ar'): string => {
  if (language !== 'en' || !text) return text;
  
  const trimmed = text.trim();
  if (MOCKUP_UI_STRINGS_EN[trimmed]) {
    return text.replace(trimmed, MOCKUP_UI_STRINGS_EN[trimmed]);
  }

  // If quoted like "أذكار الصباح" or 'أذكار الصباح' or «أذكار الصباح»
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
      (trimmed.startsWith("'") && trimmed.endsWith("'")) || 
      (trimmed.startsWith('«') && trimmed.endsWith('»'))) {
    const inner = trimmed.slice(1, -1).trim();
    if (MOCKUP_UI_STRINGS_EN[inner]) {
      return text.replace(trimmed, `"${MOCKUP_UI_STRINGS_EN[inner]}"`);
    }
  }

  // Check if it is a pure number or contains Arabic digits
  if (/^[٠-٩0-9,.\s]+$/.test(trimmed)) {
    return text.replace(trimmed, convertArabicDigitsToEnglish(trimmed));
  }

  // Handle "X مرات" or "X مرة"
  if (trimmed.includes('مرات') || trimmed.includes('مرة')) {
    let m = convertArabicDigitsToEnglish(trimmed)
      .replace('مرات', 'times')
      .replace('مرة', 'times');
    return text.replace(trimmed, m);
  }

  // Handle template patterns:
  // 1. Time string like "٠٣:٠٠ م" or "١١:٠٨ م"
  if (trimmed.includes('م') || trimmed.includes('ص')) {
    let t = trimmed;
    t = t.replace('م', 'PM').replace('ص', 'AM');
    t = convertArabicDigitsToEnglish(t);
    return text.replace(trimmed, t);
  }

  // 2. Surah name or Ayah range like "سورة ... (الآيات ...)"
  if (trimmed.startsWith('سورة ')) {
    let s = trimmed;
    s = convertArabicDigitsToEnglish(s);
    s = s.replace('سورة', 'Surah').replace('الآيات', 'Verses');
    return text.replace(trimmed, s);
  }

  // 3. Percentage like "٨٥٪"
  if (trimmed.includes('٪')) {
    let p = convertArabicDigitsToEnglish(trimmed).replace('٪', '%');
    return text.replace(trimmed, p);
  }

  // 4. Prayer time like "أذان ..."
  if (trimmed.startsWith('أذان ')) {
    const pName = trimmed.replace('أذان', '').trim();
    const pEn = MOCKUP_UI_STRINGS_EN[pName] || pName;
    return text.replace(trimmed, `${pEn} Adhan`);
  }

  // 5. Generic Arabic digits in text
  if (/[٠-٩]/.test(trimmed)) {
    return convertArabicDigitsToEnglish(text);
  }

  return text;
};

// Translate explanation data object for ButtonExplanationModal
export const translateExplanationData = (
  data: ButtonExplanationData,
  language: string = 'ar'
): ButtonExplanationData => {
  if (language !== 'en' || !data) return data;

  const rawTitle = data.title ? data.title.trim() : '';
  const match = BUTTON_EXPLANATIONS_EN[rawTitle];

  if (match) {
    return {
      ...data,
      title: match.title,
      purpose: match.purpose || data.purpose,
      singleClickAction: match.singleClickAction || data.singleClickAction,
      longPressAction: match.longPressAction || data.longPressAction,
    };
  }

  // Handle dynamic template titles
  // 1. Prayer time card: "بطاقة وقت الفجر"
  if (rawTitle.startsWith('بطاقة وقت ')) {
    const prayerAr = rawTitle.replace('بطاقة وقت ', '').trim();
    const prayerEn = MOCKUP_UI_STRINGS_EN[prayerAr] || prayerAr;
    return {
      ...data,
      title: `${prayerEn} Prayer Time Card`,
      purpose: `Displays the exact timing for ${prayerEn} prayer, along with the mosque Iqama alert and notification settings.`
    };
  }

  // 2. Chapter / Category: "قسم: ..."
  if (rawTitle.startsWith('قسم: ')) {
    const catAr = rawTitle.replace('قسم: ', '').trim();
    const catEn = MOCKUP_UI_STRINGS_EN[catAr] || catAr;
    return {
      ...data,
      title: `Chapter: ${catEn}`,
      purpose: `Opens all verified supplications and daily remembrance recorded in Fortress of the Muslim (Hisn Al-Muslim) regarding ${catEn}.`
    };
  }

  // 3. Calendar day: "يوم ..."
  if (rawTitle.startsWith('يوم ')) {
    const dayConverted = convertArabicDigitsToEnglish(rawTitle);
    return {
      ...data,
      title: dayConverted,
      purpose: 'Displays day details, prayer timings, and recommended voluntary fasting (White Days, Mondays, and Thursdays).'
    };
  }

  // 4. Divine Name: "اسم الله: ..."
  if (rawTitle.startsWith('اسم الله: ')) {
    const nameAr = rawTitle.replace('اسم الله: ', '').trim();
    const nameEn = MOCKUP_UI_STRINGS_EN[nameAr] || nameAr;
    return {
      ...data,
      title: `Divine Name: ${nameEn}`,
      purpose: `Detailed explanation of the Beautiful Name ${nameEn} with scriptural evidence from the Holy Quran and authentic Sunnah.`
    };
  }

  // 5. Seerah Station: "المحطة ..."
  if (rawTitle.startsWith('المحطة ')) {
    return {
      ...data,
      title: convertArabicDigitsToEnglish(rawTitle.replace('المحطة', 'Milestone Station')),
      purpose: data.purpose ? 'Historical details and vital spiritual lessons from this milestone in the life of the Prophet Muhammad ﷺ.' : undefined
    };
  }

  // 6. Site: "موقع: ..."
  if (rawTitle.startsWith('موقع: ')) {
    const siteAr = rawTitle.replace('موقع: ', '').trim();
    const siteEn = MOCKUP_UI_STRINGS_EN[siteAr] || siteAr;
    return {
      ...data,
      title: `Platform: ${siteEn}`,
      purpose: 'Direct link and overview of this authenticated Islamic research and learning portal.'
    };
  }

  // 7. Hadith: "الحديث ..."
  if (rawTitle.startsWith('الحديث ')) {
    return {
      ...data,
      title: convertArabicDigitsToEnglish(rawTitle.replace('الحديث', 'Hadith')),
      purpose: 'Complete text, narrator, and jurisprudential lessons of this foundational Hadith from the Forty Hadith of Imam An-Nawawi.'
    };
  }

  // 8. Calculator: "حاسبة: ..."
  if (rawTitle.startsWith('حاسبة: ')) {
    const calcAr = rawTitle.replace('حاسبة: ', '').trim();
    const calcEn = MOCKUP_UI_STRINGS_EN[calcAr] || calcAr;
    return {
      ...data,
      title: `Calculator: ${calcEn}`,
      purpose: 'Interactive tool according to Islamic jurisprudence to accurately determine due zakat and religious obligations.'
    };
  }

  // 9. Voice Command: 'أمر صوتي: ...'
  if (rawTitle.startsWith('أمر صوتي:')) {
    return {
      ...data,
      title: rawTitle.replace('أمر صوتي:', 'Voice Command:'),
      purpose: 'Speak this phrase to navigate or trigger this feature hands-free.'
    };
  }

  // Fallback: translate title and purpose if mapped
  return {
    ...data,
    title: tGuide(data.title, 'en'),
    purpose: data.purpose ? tGuide(data.purpose, 'en') : undefined,
    singleClickAction: data.singleClickAction ? tGuide(data.singleClickAction, 'en') : undefined,
    longPressAction: data.longPressAction ? tGuide(data.longPressAction, 'en') : undefined,
  };
};

// Deeply translates all text nodes and attributes in a React element tree
export function translateTree(
  node: React.ReactNode,
  language: string
): React.ReactNode {
  if (language !== 'en' || !node) return node;

  if (typeof node === 'string') {
    return tGuide(node, 'en');
  }

  if (typeof node === 'number' || typeof node === 'boolean') {
    return node;
  }

  if (Array.isArray(node)) {
    return node.map((child, index) => {
      const translatedChild = translateTree(child, language);
      if (React.isValidElement(translatedChild) && !translatedChild.key) {
        return React.cloneElement(translatedChild, { key: index });
      }
      return translatedChild;
    });
  }

  if (React.isValidElement(node)) {
    // If it is a functional component (e.g. Hotspot or nested component)
    if (typeof node.type === 'function') {
      const funcProps = node.props as any;
      if (funcProps && 'children' in funcProps && funcProps.children) {
        const translatedChildren = translateTree(funcProps.children, language);
        return React.cloneElement(node, { ...funcProps }, translatedChildren);
      }
      try {
        const rendered = (node.type as any)(funcProps);
        return translateTree(rendered, language);
      } catch (err) {
        return node;
      }
    }

    const props = node.props as any;
    const newProps: any = {};
    let hasPropsChanges = false;

    if (props.title && typeof props.title === 'string') {
      newProps.title = tGuide(props.title, 'en');
      hasPropsChanges = true;
    }

    if (props['aria-label'] && typeof props['aria-label'] === 'string') {
      newProps['aria-label'] = tGuide(props['aria-label'], 'en');
      hasPropsChanges = true;
    }

    if (props.placeholder && typeof props.placeholder === 'string') {
      newProps.placeholder = tGuide(props.placeholder, 'en');
      hasPropsChanges = true;
    }

    if (props.dir === 'rtl') {
      newProps.dir = 'ltr';
      hasPropsChanges = true;
    }

    if (props.className && typeof props.className === 'string') {
      let updatedClass = props.className;
      let classChanged = false;
      if (updatedClass.includes('text-right')) {
        updatedClass = updatedClass.replace(/\btext-right\b/g, 'text-left');
        classChanged = true;
      }
      if (updatedClass.includes('font-kufi')) {
        updatedClass = updatedClass.replace(/\bfont-kufi\b/g, 'font-sans');
        classChanged = true;
      }
      if (classChanged) {
        newProps.className = updatedClass;
        hasPropsChanges = true;
      }
    }

    if ('children' in props) {
      const translatedChildren = translateTree(props.children, language);
      return React.cloneElement(node, newProps, translatedChildren);
    }

    return hasPropsChanges ? React.cloneElement(node, newProps) : node;
  }

  return node;
}
