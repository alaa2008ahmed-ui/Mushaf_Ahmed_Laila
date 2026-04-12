
import {
    QuranIcon, SalahAdhkarIcon, ListenIcon, TasbeehIcon, CalendarIcon, QiblaIcon,
    HajjIcon, HisnMuslimIcon, PrayerTimesIcon, AdiaIcon, SabahMasaaIcon, RadioIcon, CalculatorIcon, TajweedIcon
} from '../components/Icons';

export const verses = [
  { text: "وَقُلْ رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا", surah: "سورة الإسراء", number: "٢٤" },
  { text: "وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ", surah: "سورة الإسراء", number: "٢٤" },
  { text: "وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا", surah: "سورة الأحقاف", number: "١٥" },
  { text: "أَنِ اشْكُرْ لِي وَلِوَالِدَيْكَ إِلَيَّ الْمَصِيرُ", surah: "سورة لقمان", number: "١٤" },
  { text: "وَقَضَىٰ رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا", surah: "سورة الإسراء", number: "٢٣" },
  { text: "إِمَّا يَبْلُغَنَّ عِنْدَكَ الْكِبَرَ أَحَدُهُمَا أَوْ كِلَاهُمَا فَلَا تَقُلْ لَهُمَا أُفٍّ", surah: "سورة الإسراء", number: "٢٣" },
  { text: "وَلَا تَنْهَرْهُمَا وَقُلْ لَهُمَا قَوْلًا كَرِيمًا", surah: "سورة الإسراء", number: "٢٣" },
  { text: "رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ", surah: "سورة إبراهيم", number: "٤١" }
];

export const navItems = [
  { id: 'quran', title: "القرآن الكريم", icon: QuranIcon, isFeatured: true },
  { id: 'sabah-masaa', title: "أذكار الصباح والمساء", icon: SabahMasaaIcon },
  { id: 'adia', title: "أدعية", icon: AdiaIcon },
  { id: 'tasbeeh', title: "التسبيح", icon: TasbeehIcon },
  { id: 'radio', title: "إذاعة القرآن", icon: RadioIcon },
  { id: 'calculators', title: "الحاسبة الشرعية", icon: CalculatorIcon },
  { id: 'salah-adhkar', title: "أذكار الصلاة", icon: SalahAdhkarIcon },
  { id: 'prayer-times', title: "مواقيت الصلاة", icon: PrayerTimesIcon },
  { id: 'qibla', title: "القبلة", icon: QiblaIcon },
  { id: 'hajj-umrah', title: "الحج والعمرة", icon: HajjIcon },
  { id: 'hisn-muslim', title: "حصن المسلم", icon: HisnMuslimIcon },
  { id: 'listen', title: "الاستماع للقرآن", icon: ListenIcon },
  { id: 'calendar', title: "التقويم", icon: CalendarIcon },
  { id: 'nawawi', title: 'الأربعون النووية', icon: HisnMuslimIcon },
  { id: 'tajweed-education', title: 'تعليم التجويد', icon: TajweedIcon }
];
