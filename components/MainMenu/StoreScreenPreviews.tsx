import React, { useMemo } from 'react';
import {
  MapPin,
  Clock,
  BookOpen,
  Compass,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  ChevronLeft,
  ChevronRight,
  Settings,
  Mic,
  Volume2,
  Play,
  RotateCcw,
  Sparkles,
  ScanLine,
  Camera,
  BellOff,
  Check,
  Navigation,
  Calculator,
  BookMarked,
  SlidersHorizontal,
} from 'lucide-react';
import { quranData, normalizeQuranText } from '../../utils/quranData';
import { toArabic } from '../QuranReader/constants';

export type StudioThemeId = 'gold' | 'sky' | 'emerald' | 'burgundy' | 'night';
export type StudioLang = 'ar' | 'en';

export type StoreScreenId =
  | 'home'
  | 'quran'
  | 'tadabbur'
  | 'prayer'
  | 'qibla'
  | 'tasbeeh'
  | 'lens'
  | 'calculators';

export interface StoreScreenshotSpec {
  id: StoreScreenId;
  order: number;
  labelAr: string;
  labelEn: string;
  titleAr: string;
  subtitleAr: string;
  titleEn: string;
  subtitleEn: string;
  slug: string;
}

export const STORE_SCREENSHOT_SPECS: StoreScreenshotSpec[] = [
  {
    id: 'home',
    order: 1,
    labelAr: 'الشاشة الرئيسية',
    labelEn: 'Home Screen',
    titleAr: 'مصحف أحمد وليلى — رفيقك اليومي للقرآن والعبادة',
    subtitleAr: 'واجهة ثلاثية الأبعاد مريحة للقرآن والأذكار والصلوات',
    titleEn: 'Mushaf Ahmed & Laila — Your Daily Quran & Worship Companion',
    subtitleEn: 'Tactile 3D dashboard for Quran, prayers & daily adhkar',
    slug: '01-home-screen',
  },
  {
    id: 'quran',
    order: 2,
    labelAr: 'المصحف والقراءة',
    labelEn: 'Mushaf & Reading',
    titleAr: 'قراءة ميسرة بالرسم العثماني مع تلاوات خاشعة',
    subtitleAr: 'خط عثماني نقي وتلاوة متزامنة وعلامات مرجعية ذكية',
    titleEn: 'Seamless Uthmani Mushaf Reading with Soulful Recitations',
    subtitleEn: 'Authentic Uthmani script with synced audio & bookmarks',
    slug: '02-quran-reading',
  },
  {
    id: 'tadabbur',
    order: 3,
    labelAr: 'نافذة التدبر الشاملة',
    labelEn: 'Comprehensive Tadabbur',
    titleAr: 'تفسير، أسباب نزول، إعراب، ومعاني الكلمات بلمسة واحدة',
    subtitleAr: 'علوم القرآن الميسرة تنبثق مباشرة فوق كل آية',
    titleEn: 'Tafseer, Asbab Al-Nuzul, I\'rab & Word Meanings in One Tap',
    subtitleEn: 'Instant Quranic sciences layered right over every verse',
    slug: '03-comprehensive-tadabbur',
  },
  {
    id: 'prayer',
    order: 4,
    labelAr: 'مواقيت الصلاة ومسار الشمس',
    labelEn: 'Prayer Times & Sun Path',
    titleAr: 'مواقيت دقيقة، مسار الشمس المرئي، ووضع الخشوع الصامت',
    subtitleAr: 'عداد حي وأثلاث الليل وقبة شمسية مع كتم الصوت تلقائياً',
    titleEn: 'Accurate Prayer Times, Visual Sun Path & Auto-Silent Khushu\'',
    subtitleEn: 'Live celestial arc, night thirds & automatic prayer muting',
    slug: '04-prayer-sun-path',
  },
  {
    id: 'qibla',
    order: 5,
    labelAr: 'اتجاه القبلة',
    labelEn: 'Qibla Direction',
    titleAr: 'تحديد القبلة بـ 5 طرق مبتكرة تشمل الواقع المعزز والشمس',
    subtitleAr: 'بوصلة ثلاثية الأبعاد، خريطة حية، كاميرا AR، والشمس والظل',
    titleEn: 'Find Qibla in 5 Innovative Ways Including AR & Sun Guide',
    subtitleEn: 'Compass, live map, AR camera, celestial sun/moon & shadow',
    slug: '05-qibla-5-modes',
  },
  {
    id: 'tasbeeh',
    order: 6,
    labelAr: 'المسبحة الإلكترونية',
    labelEn: 'Electronic Tasbeeh',
    titleAr: '6 تصاميم مجسمة تحاكي الواقع مع إحصائيات إنجازك',
    subtitleAr: 'مسبحة خرز وعداد رقمي وكريستال مع رسم بياني أسبوعي',
    titleEn: '6 Tactile 3D Realistic Skins with Progress Analytics',
    subtitleEn: 'Realistic 3D beads, tally clicker & weekly dhikr charts',
    slug: '06-electronic-tasbeeh',
  },
  {
    id: 'lens',
    order: 7,
    labelAr: 'عدسة المصحف الذكية',
    labelEn: 'Smart Mushaf Lens',
    titleAr: 'وجّه الكاميرا لأي مصحف ورقي للتعرف الفوري على الآية',
    subtitleAr: 'التقاط ضوئي ذكي لفتح التفسير والتلاوة في ثوانٍ',
    titleEn: 'Point Camera at Any Printed Mushaf for Instant Ayah Detection',
    subtitleEn: 'Smart optical recognition jumping straight to Tafseer & audio',
    slug: '07-smart-mushaf-lens',
  },
  {
    id: 'calculators',
    order: 8,
    labelAr: 'حاسبة الزكاة والمواريث',
    labelEn: 'Zakat & Inheritance Calculators',
    titleAr: 'حسابات شرعية دقيقة ومبسطة في ثوانٍ',
    subtitleAr: 'حاسبة الزكاة والمواريث والكفارات وزكاة الفطر والأضحية',
    titleEn: 'Accurate & Simplified Sharia Calculations in Seconds',
    subtitleEn: 'Zakat, Inheritance (Mawarith), Kaffarat & Fitr tools',
    slug: '08-zakat-inheritance',
  },
];

export interface StudioThemePalette {
  id: StudioThemeId;
  nameAr: string;
  nameEn: string;
  swatchColor: string;
  isDark: boolean;
  // 9:16 Store Backdrop Poster Colors
  posterBg: string;
  posterGlow: string;
  posterTitleColor: string;
  posterSubtitleColor: string;
  posterBadgeBg: string;
  posterBadgeText: string;
  // Phone Shell
  phoneBezelBg: string;
  phoneBorderColor: string;
  phoneScreenBg: string;
  homeScreenBg: string;
  // In-App Real UI Colors (matching index.css)
  appTitleColor: string;
  topBarBg: string;
  topBarText: string;
  primaryAccent: string;
  pillBg: string;
  pillText: string;
  pillShadow: string;
  cardGradient: string;
  cardBorder: string;
  cardShadow: string;
  insetCardBg: string;
  insetCardBorder: string;
  insetCardShadow: string;
  recessedBg: string;
  textPrimary: string;
  textSecondary: string;
  dividerColor: string;
  mushafPaperBg: string;
  mushafText: string;
  mushafAccent: string;
}

export const STUDIO_THEMES: Record<StudioThemeId, StudioThemePalette> = {
  gold: {
    id: 'gold',
    nameAr: 'الذهبي الملكي',
    nameEn: 'Royal Gold',
    swatchColor: '#D97706',
    isDark: false,
    posterBg: 'linear-gradient(160deg, #582205 0%, #854D0E 36%, #B45309 72%, #D97706 100%)',
    posterGlow: 'rgba(254, 240, 138, 0.35)',
    posterTitleColor: '#FFFFFF',
    posterSubtitleColor: '#FEF3C7',
    posterBadgeBg: 'rgba(255, 255, 255, 0.16)',
    posterBadgeText: '#FEF9C3',
    phoneBezelBg: 'linear-gradient(145deg, #27272A 0%, #09090B 100%)',
    phoneBorderColor: '#FDE047',
    phoneScreenBg: '#FEF9C3',
    homeScreenBg: '#FFFFFF',
    appTitleColor: '#78350F',
    topBarBg: 'linear-gradient(135deg, #F59E0B 0%, #B45309 100%)',
    topBarText: '#FFFFFF',
    primaryAccent: '#B45309',
    pillBg: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
    pillText: '#FFFFFF',
    pillShadow: '0 3px 0 #78350F, 0 5px 10px rgba(180,83,9,0.28)',
    cardGradient: 'linear-gradient(145deg, #FFFDF0 0%, #FEF3C7 26%, #FDE68A 65%, #FCD34D 100%)',
    cardBorder: 'rgba(217, 119, 6, 0.42)',
    cardShadow: '0 6px 14px rgba(180, 83, 9, 0.2), inset 0 1.5px 1px rgba(255,255,255,0.9)',
    insetCardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 65%, #FEF9E7 100%)',
    insetCardBorder: 'rgba(217, 119, 6, 0.3)',
    insetCardShadow: '0 3px 0 rgba(180,115,20,0.22), 0 6px 12px rgba(180,115,20,0.14)',
    recessedBg: '#FEF3C7',
    textPrimary: '#1C1917',
    textSecondary: '#78350F',
    dividerColor: 'rgba(217, 119, 6, 0.25)',
    mushafPaperBg: '#FFFFFF',
    mushafText: '#1C1917',
    mushafAccent: '#B45309',
  },
  sky: {
    id: 'sky',
    nameAr: 'السماوي النقي',
    nameEn: 'Pure Sky',
    swatchColor: '#0284C7',
    isDark: false,
    posterBg: 'linear-gradient(160deg, #082F49 0%, #075985 38%, #0369A1 72%, #0284C7 100%)',
    posterGlow: 'rgba(125, 211, 252, 0.35)',
    posterTitleColor: '#FFFFFF',
    posterSubtitleColor: '#E0F2FE',
    posterBadgeBg: 'rgba(255, 255, 255, 0.16)',
    posterBadgeText: '#E0F2FE',
    phoneBezelBg: 'linear-gradient(145deg, #1E293B 0%, #090D16 100%)',
    phoneBorderColor: '#7DD3FC',
    phoneScreenBg: '#F0F9FF',
    homeScreenBg: '#FFFFFF',
    appTitleColor: '#0369A1',
    topBarBg: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
    topBarText: '#FFFFFF',
    primaryAccent: '#0369A1',
    pillBg: 'linear-gradient(180deg, #0284C7 0%, #0369A1 100%)',
    pillText: '#FFFFFF',
    pillShadow: '0 3px 0 #075985, 0 5px 10px rgba(3,105,161,0.3)',
    cardGradient: 'linear-gradient(140deg, #F0F9FF 0%, #E0F2FE 22%, #BAE6FD 60%, #7DD3FC 100%)',
    cardBorder: 'rgba(14, 165, 233, 0.45)',
    cardShadow: '0 6px 14px rgba(2, 132, 199, 0.22), inset 0 1.5px 1px rgba(255,255,255,0.95)',
    insetCardBg: 'linear-gradient(180deg, #F5FAFF 0%, #EBF5FD 60%, #E1F1FB 100%)',
    insetCardBorder: 'rgba(186, 230, 253, 0.95)',
    insetCardShadow: '0 3px 0 rgba(14,165,233,0.22), 0 6px 12px rgba(2,132,199,0.14)',
    recessedBg: '#E0F2FE',
    textPrimary: '#0F172A',
    textSecondary: '#0369A1',
    dividerColor: 'rgba(14, 165, 233, 0.25)',
    mushafPaperBg: '#FFFFFF',
    mushafText: '#0F172A',
    mushafAccent: '#0369A1',
  },
  emerald: {
    id: 'emerald',
    nameAr: 'الزمردي المضيء',
    nameEn: 'Luminous Emerald',
    swatchColor: '#059669',
    isDark: false,
    posterBg: 'linear-gradient(160deg, #022C22 0%, #064E3B 38%, #047857 74%, #059669 100%)',
    posterGlow: 'rgba(110, 231, 183, 0.34)',
    posterTitleColor: '#FFFFFF',
    posterSubtitleColor: '#D1FAE5',
    posterBadgeBg: 'rgba(255, 255, 255, 0.16)',
    posterBadgeText: '#ECFDF5',
    phoneBezelBg: 'linear-gradient(145deg, #1E293B 0%, #090D16 100%)',
    phoneBorderColor: '#6EE7B7',
    phoneScreenBg: '#F0FDF4',
    homeScreenBg: '#FFFFFF',
    appTitleColor: '#047857',
    topBarBg: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    topBarText: '#FFFFFF',
    primaryAccent: '#047857',
    pillBg: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
    pillText: '#FFFFFF',
    pillShadow: '0 3px 0 #064E3B, 0 5px 10px rgba(4,120,87,0.3)',
    cardGradient: 'linear-gradient(140deg, #F0FDF4 0%, #DCFCE7 22%, #A7F3D0 60%, #6EE7B7 100%)',
    cardBorder: 'rgba(16, 185, 129, 0.45)',
    cardShadow: '0 6px 14px rgba(5, 150, 105, 0.22), inset 0 1.5px 1px rgba(255,255,255,0.95)',
    insetCardBg: 'linear-gradient(180deg, #F4FBF7 0%, #E8F7EE 60%, #DDF3E6 100%)',
    insetCardBorder: 'rgba(167, 243, 208, 0.95)',
    insetCardShadow: '0 3px 0 rgba(16,185,129,0.22), 0 6px 12px rgba(5,150,105,0.14)',
    recessedBg: '#DCFCE7',
    textPrimary: '#0F172A',
    textSecondary: '#047857',
    dividerColor: 'rgba(16, 185, 129, 0.25)',
    mushafPaperBg: '#FFFFFF',
    mushafText: '#064E3B',
    mushafAccent: '#047857',
  },
  burgundy: {
    id: 'burgundy',
    nameAr: 'العنابي الفاخر',
    nameEn: 'Royal Burgundy',
    swatchColor: '#9F1239',
    isDark: false,
    posterBg: 'linear-gradient(160deg, #3B0414 0%, #6B0A25 38%, #881337 74%, #9F1239 100%)',
    posterGlow: 'rgba(253, 164, 175, 0.34)',
    posterTitleColor: '#FFFFFF',
    posterSubtitleColor: '#FFE4E6',
    posterBadgeBg: 'rgba(255, 255, 255, 0.16)',
    posterBadgeText: '#FFF1F2',
    phoneBezelBg: 'linear-gradient(145deg, #27272A 0%, #09090B 100%)',
    phoneBorderColor: '#FDA4AF',
    phoneScreenBg: '#FFF1F2',
    homeScreenBg: '#FFFFFF',
    appTitleColor: '#881337',
    topBarBg: 'linear-gradient(135deg, #9F1239 0%, #881337 100%)',
    topBarText: '#FFFFFF',
    primaryAccent: '#881337',
    pillBg: 'linear-gradient(180deg, #9F1239 0%, #881337 100%)',
    pillText: '#FFFFFF',
    pillShadow: '0 3px 0 #4C0519, 0 5px 10px rgba(136,19,55,0.32)',
    cardGradient: 'linear-gradient(140deg, #FFF1F2 0%, #FFE4E6 22%, #FECDD3 60%, #FDA4AF 100%)',
    cardBorder: 'rgba(225, 29, 72, 0.42)',
    cardShadow: '0 6px 14px rgba(159, 18, 57, 0.22), inset 0 1.5px 1px rgba(255,255,255,0.95)',
    insetCardBg: 'linear-gradient(180deg, #FEF4F6 0%, #FDE8EB 60%, #FBDFE4 100%)',
    insetCardBorder: 'rgba(254, 205, 211, 0.95)',
    insetCardShadow: '0 3px 0 rgba(225,29,72,0.22), 0 6px 12px rgba(159,18,57,0.14)',
    recessedBg: '#FFE4E6',
    textPrimary: '#1F1215',
    textSecondary: '#881337',
    dividerColor: 'rgba(225, 29, 72, 0.22)',
    mushafPaperBg: '#FFFFFF',
    mushafText: '#1F1215',
    mushafAccent: '#881337',
  },
  night: {
    id: 'night',
    nameAr: 'الليلي الفاحم',
    nameEn: 'Night Gold',
    swatchColor: '#18181B',
    isDark: true,
    posterBg: 'linear-gradient(160deg, #1E180F 0%, #0D0D12 45%, #000000 100%)',
    posterGlow: 'rgba(245, 158, 11, 0.26)',
    posterTitleColor: '#FFFFFF',
    posterSubtitleColor: '#FDE68A',
    posterBadgeBg: 'rgba(245, 158, 11, 0.16)',
    posterBadgeText: '#FBBF24',
    phoneBezelBg: 'linear-gradient(145deg, #3F3F46 0%, #18181B 100%)',
    phoneBorderColor: '#F59E0B',
    phoneScreenBg: '#000000',
    homeScreenBg: '#000000',
    appTitleColor: '#FFFFFF',
    topBarBg: 'linear-gradient(180deg, #18181B 0%, #09090B 100%)',
    topBarText: '#FFFFFF',
    primaryAccent: '#F59E0B',
    pillBg: 'linear-gradient(180deg, #FFFFFF 0%, #F3ECE0 100%)',
    pillText: '#000000',
    pillShadow: '0 3px 0 #09090D, 0 6px 12px rgba(0,0,0,0.6)',
    cardGradient: 'linear-gradient(168deg, #282832 0%, #1B1B23 50%, #131319 100%)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardShadow: '0 4px 0 #09090D, 0 10px 20px rgba(0, 0, 0, 0.85), inset 0 1.5px 1px rgba(255,255,255,0.18)',
    insetCardBg: 'linear-gradient(180deg, #363644 0%, #262631 60%, #1D1D26 100%)',
    insetCardBorder: 'rgba(255, 255, 255, 0.1)',
    insetCardShadow: '0 3px 0 #09090D, 0 6px 12px rgba(0,0,0,0.6)',
    recessedBg: '#121218',
    textPrimary: '#FFFFFF',
    textSecondary: '#FBBF24',
    dividerColor: 'rgba(255, 255, 255, 0.1)',
    mushafPaperBg: '#0B0B0F',
    mushafText: '#F8FAFC',
    mushafAccent: '#FBBF24',
  },
};

const ICON_PATHS = {
  quran: '/assets/3d_icons/icon_quran.png',
  prayer: '/assets/3d_icons/icon_prayer_times.png',
  qibla: '/assets/3d_icons/icon_qibla.png',
  tasbeeh: '/assets/3d_icons/icon_tasbeeh.png',
  adhkar: '/assets/3d_icons/icon_sabah_masaa.png',
  adia: '/assets/3d_icons/icon_adia.png',
  calc: '/assets/3d_icons/icon_calculators.png',
  hisn: '/assets/3d_icons/icon_hisn.png',
};

function getSampleSurahAyahs() {
  try {
    const fatihah = quranData?.surahs?.[0];
    const kahf = quranData?.surahs?.[17];
    const baqarah = quranData?.surahs?.[1];

    const fatihahAyahs = (fatihah?.ayahs || []).slice(0, 5).map((a: any) => ({
      numberInSurah: a.numberInSurah,
      text: normalizeQuranText(a.text),
    }));

    const kahfAyah10 = normalizeQuranText(
      kahf?.ayahs?.[9]?.text || 'إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ فَقَالُوا۟ رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا'
    );

    const kursi = normalizeQuranText(
      baqarah?.ayahs?.[254]?.text || 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ'
    );

    return { fatihahAyahs, kahfAyah10, kursi };
  } catch {
    return {
      fatihahAyahs: [
        { numberInSurah: 1, text: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
        { numberInSurah: 2, text: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ' },
        { numberInSurah: 3, text: 'ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ' },
        { numberInSurah: 4, text: 'مَـٰلِكِ يَوْمِ ٱلدِّينِ' },
        { numberInSurah: 5, text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ' },
      ],
      kahfAyah10: 'إِذْ أَوَى ٱلْفِتْيَةُ إِلَى ٱلْكَهْفِ فَقَالُوا۟ رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا',
      kursi: 'ٱللَّهُ لَآ إِلَـٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌ وَلَا نَوْمٌ',
    };
  }
}

interface LiveScreenProps {
  screenId: StoreScreenId;
  palette: StudioThemePalette;
  lang: StudioLang;
}

const MiniTopBar: React.FC<{
  title: string;
  palette: StudioThemePalette;
  isEn: boolean;
}> = ({ title, palette, isEn }) => (
  <div
    className="w-full px-3 py-2 flex items-center justify-between shrink-0"
    style={{
      background: palette.topBarBg,
      color: palette.topBarText,
      borderBottom: '1px solid rgba(255,255,255,0.14)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.16)',
    }}
  >
    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/15">
      {isEn ? <ChevronLeft size={13} color="#FFFFFF" /> : <ChevronRight size={13} color="#FFFFFF" />}
    </div>
    <span className="text-[11px] font-black font-cairo truncate px-2 text-white">{title}</span>
    <div className="w-6 h-6 rounded-full flex items-center justify-center bg-white/15">
      <SlidersHorizontal size={11} color="#FFFFFF" />
    </div>
  </div>
);

const LivePhoneScreenContent: React.FC<LiveScreenProps> = ({ screenId, palette, lang }) => {
  const isEn = lang === 'en';
  const dir = isEn ? 'ltr' : 'rtl';
  const { fatihahAyahs, kahfAyah10, kursi } = useMemo(() => getSampleSurahAyahs(), []);

  // 1. HOME SCREEN
  if (screenId === 'home') {
    const favIcons = [
      { img: ICON_PATHS.quran, label: isEn ? 'Quran' : 'القرآن' },
      { img: ICON_PATHS.prayer, label: isEn ? 'Prayers' : 'المواقيت' },
      { img: ICON_PATHS.adhkar, label: isEn ? 'Adhkar' : 'الأذكار' },
      { img: ICON_PATHS.qibla, label: isEn ? 'Qibla' : 'القبلة' },
      { img: ICON_PATHS.tasbeeh, label: isEn ? 'Tasbeeh' : 'التسبيح' },
    ];

    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden"
        style={{ backgroundColor: palette.homeScreenBg, color: palette.textPrimary }}
      >
        {/* Real Modern Home Sticky Bar */}
        <div
          className="px-3 pt-2.5 pb-2 flex items-center justify-between shrink-0"
          style={{
            backgroundColor: palette.homeScreenBg,
            borderBottom: `1px solid ${palette.dividerColor}`,
          }}
        >
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: palette.primaryAccent }}>
            <Settings size={13} />
          </div>
          <span className="text-[12.5px] font-black tracking-tight" style={{ color: palette.appTitleColor }}>
            {isEn ? 'Mushaf Ahmed & Laila' : 'مُصْحَفُ أَحْمَدَ وَلَيْلَى'}
          </span>
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ color: palette.primaryAccent }}>
            {palette.isDark ? <Sun size={13} /> : <Moon size={13} />}
          </div>
        </div>

        <div className="flex-1 p-2.5 flex flex-col gap-2.5 overflow-hidden">
          {/* Card 1: Continue Quran Card */}
          <div
            className="rounded-2xl p-2.5 flex flex-col gap-2"
            style={{
              background: palette.cardGradient,
              border: `1px solid ${palette.cardBorder}`,
              boxShadow: palette.cardShadow,
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-[10.5px] font-black truncate" style={{ color: palette.isDark ? '#FBBF24' : palette.textSecondary }}>
                  {isEn ? 'Continue Quran Recitation' : 'تابع تلاوة المصحف'}
                </div>
                <div className="text-[9px] font-bold mt-0.5 truncate" style={{ color: palette.textPrimary }}>
                  {isEn ? 'Al-Kahf • Ayah 10 • Juz 15 • P.293' : 'سورة الكهف • الآية ١٠ • الجزء ١٥'}
                </div>
              </div>
              <div
                className="px-2.5 py-1 rounded-full text-[8.5px] font-black shrink-0"
                style={{
                  background: palette.pillBg,
                  color: palette.pillText,
                  boxShadow: palette.pillShadow,
                }}
              >
                {isEn ? 'Landscape' : 'عرضي'}
              </div>
            </div>

            {/* Ayah Ticker Bar */}
            <div
              className="rounded-xl px-2.5 py-1.5 text-[9.5px] truncate font-medium"
              style={{
                background: palette.insetCardBg,
                border: `1px solid ${palette.insetCardBorder}`,
                color: palette.textPrimary,
                fontFamily: 'var(--font-amiri-quran)',
              }}
            >
              {isEn
                ? '(18:10) Our Lord, grant us from Yourself mercy...'
                : '(آية ١٠) رَبَّنَآ ءَاتِنَا مِن لَّدُنكَ رَحْمَةً وَهَيِّئْ لَنَا...'}
            </div>
          </div>

          {/* Card 2: Prayer Times & Countdown Card */}
          <div
            className="rounded-2xl p-2.5 flex flex-col gap-2"
            style={{
              background: palette.cardGradient,
              border: `1px solid ${palette.cardBorder}`,
              boxShadow: palette.cardShadow,
            }}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1 text-[9.5px] font-bold" style={{ color: palette.textPrimary }}>
                  <MapPin size={10} style={{ color: palette.primaryAccent }} />
                  <span>{isEn ? 'Makkah Al-Mukarramah • 28°C' : 'مكة المكرمة • ٢٨°م'}</span>
                </div>
                <div className="text-[8.5px] font-bold mt-0.5" style={{ color: palette.isDark ? '#FDE68A' : palette.textSecondary }}>
                  {isEn ? '15 Ramadan 1447 AH' : '١٥ رمضان ١٤٤٧ هـ'}
                </div>
              </div>
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center"
                style={{ background: palette.insetCardBg, boxShadow: palette.insetCardShadow }}
              >
                <Compass size={13} style={{ color: palette.primaryAccent }} />
              </div>
            </div>

            <div
              className="rounded-xl p-2 flex items-center justify-between"
              style={{
                background: palette.insetCardBg,
                border: `1px solid ${palette.insetCardBorder}`,
                boxShadow: palette.insetCardShadow,
              }}
            >
              <div>
                <div className="text-[8px] font-bold opacity-75" style={{ color: palette.textPrimary }}>
                  {isEn ? 'Next Prayer: Asr' : 'الصلاة القادمة: العصر'}
                </div>
                <div className="text-[13px] font-black font-mono leading-tight" style={{ color: palette.primaryAccent }}>
                  03:38 {isEn ? 'PM' : 'م'}
                </div>
              </div>
              <div className="text-end">
                <div className="text-[8px] font-bold opacity-75" style={{ color: palette.textPrimary }}>
                  {isEn ? 'Remaining' : 'المتبقي'}
                </div>
                <div className="text-[11px] font-black font-mono tabular-nums" style={{ color: palette.textPrimary }}>
                  -01:24:18
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Quick Daily Apps Grid with real 3D Icons */}
          <div
            className="rounded-2xl p-2.5 flex flex-col gap-1.5 flex-1 min-h-0"
            style={{
              background: palette.cardGradient,
              border: `1px solid ${palette.cardBorder}`,
              boxShadow: palette.cardShadow,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black" style={{ color: palette.isDark ? '#FBBF24' : palette.textSecondary }}>
                {isEn ? 'Your Daily Apps' : 'التطبيقات اليومية'}
              </span>
              <div className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: palette.insetCardBg }}>
                  <Mic size={10} style={{ color: palette.primaryAccent }} />
                </span>
              </div>
            </div>

            <div
              className="rounded-xl p-2 grid grid-cols-5 gap-1 items-center flex-1"
              style={{
                background: palette.insetCardBg,
                border: `1px solid ${palette.insetCardBorder}`,
                boxShadow: palette.insetCardShadow,
              }}
            >
              {favIcons.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center justify-center gap-1">
                  <img
                    src={item.img}
                    alt={item.label}
                    className="w-8 h-8 object-contain"
                    style={{ filter: 'drop-shadow(0 3px 4px rgba(0,0,0,0.2))' }}
                  />
                  <span
                    className="text-[7px] font-black text-center leading-tight whitespace-nowrap"
                    style={{ color: palette.isDark ? '#FFFFFF' : palette.textPrimary }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. QURAN & READING
  if (screenId === 'quran') {
    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden"
        style={{ backgroundColor: palette.mushafPaperBg, color: palette.mushafText }}
      >
        {/* Top Bar */}
        <div
          className="px-3 py-2 flex items-center justify-between text-[9px] font-bold shrink-0"
          style={{
            background: palette.isDark ? '#141418' : '#F8FAFC',
            borderBottom: `1px solid ${palette.dividerColor}`,
            color: palette.mushafAccent,
          }}
        >
          <span>{isEn ? 'Juz 1 • Hizb 1' : 'الجزء ١ • الحزب ١'}</span>
          <span className="font-black text-[10px]">{isEn ? 'Al-Fatihah' : 'سُورَةُ الْفَاتِحَةِ'}</span>
          <span>{isEn ? 'Page 1' : 'صفحة ١'}</span>
        </div>

        {/* Authentic Ornate SurahHeader Banner */}
        <div className="px-3 pt-2.5 shrink-0">
          <div
            className="rounded-2xl p-1.5 flex items-center justify-between relative"
            style={{
              background: palette.topBarBg,
              boxShadow: '0 4px 12px rgba(0,0,0,0.16)',
            }}
          >
            <span className="text-[7.5px] font-bold text-white/95 px-2 py-0.5 rounded-full bg-white/15">
              {isEn ? 'Meccan' : 'مكية'}
            </span>
            <div
              className="px-4 py-1 rounded-xl font-black text-[11px]"
              style={{
                backgroundColor: palette.isDark ? '#09090B' : '#FFFFFF',
                color: palette.mushafAccent,
                fontFamily: 'var(--font-amiri)',
              }}
            >
              {isEn ? 'Surah Al-Fatihah' : 'سُورَةُ الْفَاتِحَةِ'}
            </div>
            <span className="text-[7.5px] font-bold text-white/95 px-2 py-0.5 rounded-full bg-white/15">
              {isEn ? '7 Verses' : '٧ آيات'}
            </span>
          </div>
        </div>

        {/* Authentic Uthmani Script Page Container */}
        <div className="flex-1 px-3 py-2.5 flex flex-col justify-center">
          <div
            className="rounded-2xl p-3 flex-1 flex flex-col justify-between"
            style={{
              backgroundColor: palette.mushafPaperBg,
              border: `1.5px solid ${palette.mushafAccent}35`,
              boxShadow: palette.isDark ? 'inset 0 0 24px rgba(245,158,11,0.06)' : 'inset 0 0 20px rgba(0,0,0,0.03)',
            }}
          >
            <div
              dir="rtl"
              className="text-center leading-[2.05] text-[13.5px] font-normal select-none"
              style={{ fontFamily: 'var(--font-amiri-quran)', color: palette.mushafText }}
            >
              {fatihahAyahs.map((ayah, index) => {
                const isHighlighted = index === 1;
                return (
                  <span
                    key={ayah.numberInSurah}
                    className="inline"
                    style={
                      isHighlighted
                        ? {
                            backgroundColor: `${palette.mushafAccent}22`,
                            borderRadius: '6px',
                            padding: '1px 3px',
                          }
                        : undefined
                    }
                  >
                    {ayah.text}{' '}
                    <span
                      className="inline-block text-[11px] font-bold mx-0.5"
                      style={{ color: palette.mushafAccent }}
                    >
                      ﴿{toArabic(ayah.numberInSurah)}﴾
                    </span>{' '}
                  </span>
                );
              })}
            </div>

            {isEn && (
              <div
                dir="ltr"
                className="mt-1.5 pt-1.5 text-[8.5px] leading-snug text-center opacity-85"
                style={{ borderTop: `1px dashed ${palette.dividerColor}`, color: palette.textPrimary }}
              >
                &ldquo;All praise is due to Allah, Lord of the worlds&rdquo;
              </div>
            )}

            {/* Audio Recitation Floating Player */}
            <div
              className="rounded-xl px-2.5 py-2 flex items-center justify-between gap-2 mt-2"
              style={{
                background: palette.cardGradient,
                border: `1px solid ${palette.cardBorder}`,
                boxShadow: palette.cardShadow,
              }}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: palette.pillBg, color: palette.pillText }}
                >
                  <Volume2 size={11} />
                </div>
                <div className="min-w-0">
                  <div className="text-[8.5px] font-black truncate" style={{ color: palette.textPrimary }}>
                    {isEn ? 'Sheikh Maher Al-Muaiqly' : 'ماهر المعيقلي'}
                  </div>
                  <div className="text-[7px] font-bold opacity-75" style={{ color: palette.textPrimary }}>
                    {isEn ? 'Verse 2 • Continuous' : 'الآية ٢ • تلاوة خاشعة'}
                  </div>
                </div>
              </div>
              <div
                className="px-2 py-1 rounded-full text-[8px] font-black flex items-center gap-1 shrink-0"
                style={{ background: palette.pillBg, color: palette.pillText }}
              >
                <Play size={8} fill="currentColor" />
                <span>{isEn ? 'Playing' : 'يُتلى'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. COMPREHENSIVE TADABBUR MODAL (Verse Options + Tafseer/Asbab/Irab/Meanings)
  if (screenId === 'tadabbur') {
    const options = [
      { label: isEn ? 'Tafseer Al-Sa\'di' : 'تفسير الآية', active: true },
      { label: isEn ? 'Asbab Al-Nuzul' : 'أسباب النزول والقصص', active: false },
      { label: isEn ? 'Syntax & I\'rab' : 'إعراب الآية وبيانها', active: false },
      { label: isEn ? 'Word Meanings' : 'معاني الكلمات', active: false },
    ];

    return (
      <div
        dir={dir}
        className="w-full h-full relative flex flex-col justify-between p-2.5 font-cairo overflow-hidden"
        style={{
          backgroundColor: palette.isDark ? '#050507' : '#D4D4D8',
        }}
      >
        {/* Background dimmed Mushaf verse */}
        <div
          dir="rtl"
          className="text-center text-[11px] leading-relaxed px-2 pt-1 opacity-55"
          style={{
            fontFamily: 'var(--font-amiri-quran)',
            color: palette.isDark ? '#E4E4E7' : '#18181B',
          }}
        >
          {kursi}
        </div>

        {/* Authentic VerseOptionsModal 3D Dialog */}
        <div
          className="rounded-2xl p-2.5 flex flex-col gap-2"
          style={{
            backgroundColor: palette.isDark ? '#141419' : '#FFFFFF',
            border: `1.5px solid ${palette.primaryAccent}40`,
            boxShadow: '0 14px 30px rgba(0,0,0,0.38)',
          }}
        >
          {/* Modal Header */}
          <div
            className="rounded-xl px-2.5 py-1.5 flex items-center justify-between"
            style={{ background: palette.topBarBg }}
          >
            <span className="text-[9.5px] font-black text-white">
              {isEn ? 'Verse Options & Sciences' : 'خيارات وتدبر الآية'}
            </span>
            <span className="text-[8px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white">
              {isEn ? 'Al-Baqarah 255' : 'البقرة ٢٥٥'}
            </span>
          </div>

          {/* 3D Science Action Grid */}
          <div className="grid grid-cols-2 gap-1.5">
            {options.map((opt, idx) => (
              <div
                key={idx}
                className="rounded-xl px-2 py-1.5 text-[8.5px] font-black flex items-center justify-between"
                style={
                  opt.active
                    ? {
                        background: palette.pillBg,
                        color: palette.pillText,
                        boxShadow: palette.pillShadow,
                      }
                    : {
                        background: palette.insetCardBg,
                        color: palette.textPrimary,
                        border: `1px solid ${palette.insetCardBorder}`,
                      }
                }
              >
                <span className="truncate">{opt.label}</span>
                <BookOpen size={9} className="shrink-0" />
              </div>
            ))}
          </div>

          {/* Live Tafseer & Words Preview Box */}
          <div
            className="rounded-xl p-2 space-y-1"
            style={{
              background: palette.recessedBg,
              border: `1px solid ${palette.dividerColor}`,
            }}
          >
            <div className="flex items-center justify-between text-[8px] font-black" style={{ color: palette.primaryAccent }}>
              <span>{isEn ? 'Al-Sa\'di Tafseer' : 'تفسير السعدي الميسر'}</span>
              <span>{isEn ? 'I\'rab & Meanings' : 'إعراب ومعاني'}</span>
            </div>
            <p className="text-[8px] leading-relaxed font-semibold" style={{ color: palette.textPrimary }}>
              {isEn
                ? 'Ayat Al-Kursi — The greatest verse in the Quran; affirming Allah\'s complete life, self-subsistence & sovereignty.'
                : 'أعظم آية في كتاب الله، تتضمن توحيد الأسماء والصفات؛ ﴿ٱلْحَىُّ﴾ كامل الحياة، ﴿ٱلْقَيُّومُ﴾ القائم على كل شيء.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 4. PRAYER TIMES & VISUAL SUN PATH
  if (screenId === 'prayer') {
    const prayers = [
      { name: isEn ? 'Fajr' : 'الفجر', time: isEn ? '04:42 AM' : '٤:٤٢ ص', next: false },
      { name: isEn ? 'Dhuhr' : 'الظهر', time: isEn ? '12:18 PM' : '١٢:١٨ م', next: false },
      { name: isEn ? 'Asr' : 'العصر', time: isEn ? '03:38 PM' : '٣:٣٨ م', next: true },
      { name: isEn ? 'Maghrib' : 'المغرب', time: isEn ? '06:04 PM' : '٦:٠٤ م', next: false },
    ];

    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden"
        style={{ backgroundColor: palette.phoneScreenBg, color: palette.textPrimary }}
      >
        <MiniTopBar title={isEn ? 'Prayer Times' : 'مواقيت الصلاة'} palette={palette} isEn={isEn} />

        <div className="flex-1 p-2.5 flex flex-col gap-2 overflow-hidden">
          {/* NextPrayerCard */}
          <div
            className="rounded-2xl p-2 flex items-center justify-between gap-2"
            style={{
              backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
              boxShadow: palette.insetCardShadow,
            }}
          >
            <div>
              <div className="text-[8px] font-bold opacity-75">{isEn ? 'Remaining until Asr' : 'المتبقي على العصر'}</div>
              <div className="text-[12px] font-black font-mono" style={{ color: palette.primaryAccent }}>
                01:18:45
              </div>
            </div>
            <div
              className="px-2 py-1 rounded-xl flex items-center gap-1 text-[7.5px] font-black"
              style={{
                backgroundColor: palette.isDark ? '#27272A' : `${palette.primaryAccent}16`,
                color: palette.primaryAccent,
              }}
            >
              <BellOff size={9} />
              <span>{isEn ? 'Auto-Silent Active' : 'وضع الخشوع مفعل'}</span>
            </div>
          </div>

          {/* Expanded VisualSunPath Sky Dome Stage */}
          <div
            className="rounded-2xl p-2 flex flex-col gap-1.5"
            style={{
              background: palette.isDark
                ? 'linear-gradient(180deg, #1E1B2E 0%, #0F172A 100%)'
                : 'linear-gradient(180deg, #FEF3C7 0%, #FFFBEB 100%)',
              border: `1px solid ${palette.primaryAccent}30`,
            }}
          >
            <div className="flex items-center justify-between text-[8px] font-black" style={{ color: palette.primaryAccent }}>
              <span className="flex items-center gap-1">
                <Sparkles size={9} />
                {isEn ? 'Visual Sun Path • 42°' : 'مسار الشمس المرئي • ٤٢°'}
              </span>
              <span>{isEn ? 'Daylight 12h 14m' : 'النهار ١٢ س ١٤ د'}</span>
            </div>
            {/* Authentic Solar Arc SVG */}
            <svg viewBox="0 0 240 68" className="w-full h-[54px] overflow-visible">
              <defs>
                <linearGradient id="sunArcStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.4" />
                  <stop offset="70%" stopColor="#FBBF24" stopOpacity="1" />
                  <stop offset="100%" stopColor="#EA580C" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <line x1="12" y1="56" x2="228" y2="56" stroke={palette.primaryAccent} strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />
              <path d="M 18 56 Q 120 -6 222 56" fill="none" stroke="url(#sunArcStroke)" strokeWidth="2.5" strokeLinecap="round" />
              {/* Glowing Sun Sphere at ~68% progress */}
              <circle cx="158" cy="28" r="11" fill="#FBBF24" fillOpacity="0.28" />
              <circle cx="158" cy="28" r="6" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
            </svg>
            <div className="flex items-center justify-between text-[7.5px] font-bold opacity-80 px-1">
              <span className="flex items-center gap-0.5"><Sunrise size={8} /> {isEn ? 'Sunrise' : 'الشروق'}</span>
              <span className="flex items-center gap-0.5"><Sun size={8} /> {isEn ? 'Zawal' : 'الزوال'}</span>
              <span className="flex items-center gap-0.5"><Sunset size={8} /> {isEn ? 'Sunset' : 'المغرب'}</span>
            </div>
          </div>

          {/* Prayer Cards */}
          <div className="flex flex-col gap-1.5 flex-1">
            {prayers.map((p, idx) => (
              <div
                key={idx}
                className="rounded-xl px-2.5 py-1.5 flex items-center justify-between"
                style={
                  p.next
                    ? {
                        background: palette.pillBg,
                        color: palette.pillText,
                        boxShadow: palette.pillShadow,
                      }
                    : {
                        backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
                        color: palette.textPrimary,
                        boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                      }
                }
              >
                <span className="text-[9.5px] font-black">{p.name}</span>
                <span className="text-[9.5px] font-mono font-black">{p.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 5. QIBLA DIRECTION (5 Modes)
  if (screenId === 'qibla') {
    const modes = [
      { label: isEn ? 'Compass' : 'البوصلة', active: true },
      { label: isEn ? 'Map' : 'الخريطة', active: false },
      { label: isEn ? 'AR' : 'الواقع المعزز', active: false },
      { label: isEn ? 'Sun' : 'الشمس', active: false },
      { label: isEn ? 'Shadow' : 'الظل', active: false },
    ];

    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden"
        style={{ backgroundColor: palette.phoneScreenBg, color: palette.textPrimary }}
      >
        <MiniTopBar title={isEn ? 'Qibla Direction' : 'اتجاه القبلة'} palette={palette} isEn={isEn} />

        {/* 5 Mode Pills Strip */}
        <div className="px-2 pt-2 flex items-center justify-center gap-1 flex-wrap shrink-0">
          {modes.map((m, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded-full text-[7.5px] font-black whitespace-nowrap"
              style={
                m.active
                  ? { background: palette.pillBg, color: palette.pillText }
                  : { backgroundColor: palette.isDark ? '#27272A' : '#FFFFFF', color: palette.textPrimary }
              }
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Aligned 3D Compass + Kaaba SVG */}
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-2.5">
          <div
            className="w-36 h-36 rounded-full relative flex items-center justify-center"
            style={{
              backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
              border: '3px solid #10B981',
              boxShadow: palette.cardShadow,
            }}
          >
            <span className="absolute top-1.5 text-[9px] font-black" style={{ color: palette.primaryAccent }}>
              {isEn ? 'N' : 'ش'}
            </span>
            <span className="absolute bottom-1.5 text-[8px] font-bold opacity-50">{isEn ? 'S' : 'ج'}</span>
            <span className="absolute left-2 text-[8px] font-bold opacity-50">{isEn ? 'W' : 'غ'}</span>
            <span className="absolute right-2 text-[8px] font-bold opacity-50">{isEn ? 'E' : 'ق'}</span>

            {/* Qibla Pointer Triangle */}
            <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0" style={{ transform: 'rotate(24deg)' }}>
              <path d="M50 4 L58 20 L50 16 L42 20 Z" fill={palette.primaryAccent} />
            </svg>

            {/* Kaaba Center SVG Glyph */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center relative"
              style={{
                background: 'linear-gradient(160deg, #27272A 0%, #09090B 100%)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3)',
              }}
            >
              <div className="absolute top-2.5 inset-x-0 h-1.5 bg-amber-400" />
              <div className="w-2.5 h-3.5 bg-amber-500/90 mt-3 rounded-t-xs" />
            </div>
          </div>

          {/* Angle & Alignment Card */}
          <div
            className="w-full rounded-2xl p-2.5 text-center space-y-1"
            style={{
              backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
              boxShadow: palette.insetCardShadow,
            }}
          >
            <span
              className="inline-block px-3 py-0.5 rounded-full text-[15px] font-black font-mono"
              style={{
                backgroundColor: `${palette.primaryAccent}1A`,
                color: palette.primaryAccent,
              }}
            >
              158°
            </span>
            <div className="text-[9.5px] font-black text-emerald-600">
              {isEn ? 'Aligned with Qibla Direction ✓' : 'هذا هو اتجاه القبلة الصحيح ✓'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 6. ELECTRONIC TASBEEH (6 3D Skins + Weekly Chart)
  if (screenId === 'tasbeeh') {
    const skins = isEn
      ? ['Modern', 'Classic', 'Beads', 'Wheel', 'Crystal', 'Mechanical']
      : ['عصري', 'كلاسيكي', 'خرز', 'حلقة', 'كريستال', 'ميكانيكي'];

    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden"
        style={{ backgroundColor: palette.phoneScreenBg, color: palette.textPrimary }}
      >
        <MiniTopBar title={isEn ? 'Electronic Tasbeeh' : 'المسبحة الإلكترونية'} palette={palette} isEn={isEn} />

        <div className="flex-1 p-2.5 flex flex-col items-center justify-between gap-2 overflow-hidden">
          {/* Active Dhikr Banner */}
          <div
            className="w-full rounded-xl px-2.5 py-1.5 text-center text-[10px] font-black"
            style={{
              backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
              boxShadow: palette.insetCardShadow,
              color: palette.primaryAccent,
            }}
          >
            {isEn ? 'SubhanAllah wa bihamdihi' : 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ'}
          </div>

          {/* 6 Skins Preview Strip */}
          <div className="w-full flex items-center justify-center gap-1 flex-wrap">
            {skins.map((s, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded-full text-[7px] font-black"
                style={
                  idx === 2
                    ? { background: palette.pillBg, color: palette.pillText }
                    : {
                        backgroundColor: palette.isDark ? '#27272A' : '#FFFFFF',
                        color: palette.textPrimary,
                        opacity: 0.85,
                      }
                }
              >
                {s}
              </span>
            ))}
          </div>

          {/* Realistic 3D Bead Strand + Counter */}
          <div className="relative flex flex-col items-center justify-center my-0.5">
            <div
              className="w-24 h-24 rounded-full flex flex-col items-center justify-center relative"
              style={{
                background: palette.isDark
                  ? 'radial-gradient(circle at 30% 25%, #FDE68A 0%, #D97706 45%, #451A03 100%)'
                  : `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.92) 0%, ${palette.primaryAccent} 55%, #09090B 100%)`,
                boxShadow: `0 10px 20px ${palette.primaryAccent}45, inset 0 3px 6px rgba(255,255,255,0.55)`,
              }}
            >
              <span className="text-[24px] font-mono font-black text-white leading-none">
                {isEn ? '33' : '٣٣'}
              </span>
              <span className="text-[7.5px] font-bold text-white/90 mt-0.5">
                {isEn ? '33 / 33 Done ✓' : '٣٣ / ٣٣ اكتمل ✓'}
              </span>
            </div>
          </div>

          {/* Weekly Achievement Bar Chart Card */}
          <div
            className="w-full rounded-xl p-2 flex flex-col gap-1"
            style={{
              backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
              boxShadow: palette.insetCardShadow,
            }}
          >
            <div className="flex items-center justify-between text-[7.5px] font-black">
              <span>{isEn ? 'Weekly Achievements' : 'إحصائيات إنجازك الأسبوعي'}</span>
              <span style={{ color: palette.primaryAccent }}>{isEn ? '1,420 Dhikr' : '١٬٤٢٠ تسبيحة'}</span>
            </div>
            <div className="flex items-end justify-between gap-1.5 h-8 pt-1 px-1">
              {[42, 68, 55, 92, 74, 100, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full rounded-t-md"
                    style={{
                      height: `${h}%`,
                      background: i === 5 ? palette.primaryAccent : `${palette.primaryAccent}55`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 7. SMART MUSHAF LENS
  if (screenId === 'lens') {
    return (
      <div
        dir={dir}
        className="w-full h-full flex flex-col font-cairo overflow-hidden relative"
        style={{ backgroundColor: '#09090B', color: '#FFFFFF' }}
      >
        <MiniTopBar title={isEn ? 'Smart Mushaf Lens' : 'عدسة المصحف الذكية'} palette={palette} isEn={isEn} />

        {/* Simulated Live Camera Viewfinder over Printed Mushaf */}
        <div className="flex-1 relative p-2.5 flex flex-col justify-between">
          {/* Status Pill */}
          <div className="flex items-center justify-center">
            <span
              className="px-2.5 py-0.5 rounded-full text-[8px] font-black flex items-center gap-1"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.22)',
                border: '1px solid rgba(52, 211, 153, 0.5)',
                color: '#6EE7B7',
              }}
            >
              <ScanLine size={10} />
              <span>{isEn ? 'Ayah Recognized • 99%' : 'تم التعرف الفوري على الآية • ٩٩٪'}</span>
            </span>
          </div>

          {/* Printed Mushaf Paper Inside Corner Brackets */}
          <div className="relative mx-auto w-[92%] my-1 p-2 rounded-xl bg-[#FDFBF7] text-[#1C1917] shadow-2xl">
            {/* Corner Scan Brackets */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-amber-400 rounded-br-md" />

            <div className="text-center text-[8px] font-black text-amber-800 mb-1">
              {isEn ? 'Printed Page • Surah Al-Kahf' : 'مصحف ورقي • سُورَةُ الْكَهْفِ'}
            </div>
            <div
              dir="rtl"
              className="text-center text-[10px] leading-relaxed rounded-lg p-1.5"
              style={{
                fontFamily: 'var(--font-amiri-quran)',
                backgroundColor: 'rgba(245, 158, 11, 0.14)',
                border: '1px dashed rgba(217, 119, 6, 0.5)',
              }}
            >
              {kahfAyah10} ﴿١٠﴾
            </div>
          </div>

          {/* Instant Recognition Docked Card */}
          <div
            className="rounded-2xl p-2 flex flex-col gap-1.5"
            style={{
              background: palette.cardGradient,
              border: `1px solid ${palette.cardBorder}`,
              color: palette.textPrimary,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Camera size={12} style={{ color: palette.primaryAccent }} />
                <span className="text-[9.5px] font-black">
                  {isEn ? 'Surah Al-Kahf • Verse 10' : 'سورة الكهف • الآية ١٠'}
                </span>
              </div>
              <Check size={11} className="text-emerald-600" />
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <span
                className="py-1 rounded-xl text-center text-[8px] font-black"
                style={{ background: palette.pillBg, color: palette.pillText }}
              >
                {isEn ? 'Open Tafseer' : 'عرض التفسير'}
              </span>
              <span
                className="py-1 rounded-xl text-center text-[8px] font-black"
                style={{ background: palette.insetCardBg, color: palette.textPrimary }}
              >
                {isEn ? 'Listen Recitation' : 'استماع للآية'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 8. ZAKAT & INHERITANCE CALCULATORS
  const calcTabs = isEn
    ? ['Zakat', 'Inheritance', 'Kaffarat', 'Fitr']
    : ['الزكاة', 'المواريث', 'الكفارات', 'الفطر'];

  return (
    <div
      dir={dir}
      className="w-full h-full flex flex-col font-cairo overflow-hidden"
      style={{ backgroundColor: palette.phoneScreenBg, color: palette.textPrimary }}
    >
      <MiniTopBar title={isEn ? 'Islamic Calculators' : 'الحاسبة الشرعية'} palette={palette} isEn={isEn} />

      <div className="flex-1 p-2.5 flex flex-col gap-2 overflow-hidden">
        {/* Segmented Calculator Tabs */}
        <div
          className="rounded-xl p-1 grid grid-cols-4 gap-1"
          style={{ backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF' }}
        >
          {calcTabs.map((t, i) => (
            <span
              key={i}
              className="py-1 rounded-lg text-[7.5px] font-black text-center truncate"
              style={
                i === 0
                  ? { background: palette.pillBg, color: palette.pillText }
                  : { color: palette.textPrimary, opacity: 0.75 }
              }
            >
              {t}
            </span>
          ))}
        </div>

        {/* Recessed Input Fields */}
        <div
          className="rounded-2xl p-2 space-y-1.5"
          style={{
            backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
            boxShadow: palette.insetCardShadow,
          }}
        >
          <div className="flex items-center justify-between text-[8px] font-bold">
            <span>{isEn ? 'Cash & Savings' : 'النقود والمدخرات'}</span>
            <span style={{ color: palette.primaryAccent }}>{isEn ? '2.5% Rate' : 'نسبة ٢.٥٪'}</span>
          </div>
          <div
            className="rounded-xl px-2.5 py-1.5 text-[10px] font-black font-mono flex items-center justify-between"
            style={{ backgroundColor: palette.recessedBg, color: palette.textPrimary }}
          >
            <span>120,000</span>
            <span className="text-[8px] opacity-70">{isEn ? 'SAR / Currency' : 'ريال / عملة'}</span>
          </div>
        </div>

        {/* Zakat Due Highlighted Result Card */}
        <div
          className="rounded-2xl p-2.5 text-center space-y-0.5"
          style={{
            background: palette.pillBg,
            color: palette.pillText,
            boxShadow: palette.pillShadow,
          }}
        >
          <div className="text-[8px] font-bold opacity-90">
            {isEn ? 'Total Zakat Due' : 'إجمالي الزكاة المستحقة'}
          </div>
          <div className="text-[18px] font-black font-mono leading-tight">
            3,000
          </div>
        </div>

        {/* Mawarith (Inheritance) Quick Breakdown Strip */}
        <div
          className="rounded-2xl p-2 space-y-1 flex-1"
          style={{
            backgroundColor: palette.isDark ? '#18181B' : '#FFFFFF',
            boxShadow: palette.insetCardShadow,
          }}
        >
          <div className="flex items-center justify-between text-[8px] font-black" style={{ color: palette.primaryAccent }}>
            <span className="flex items-center gap-1">
              <Calculator size={9} />
              {isEn ? 'Mawarith Shares' : 'توزيع المواريث الشرعي'}
            </span>
            <BookMarked size={9} />
          </div>
          <div className="grid grid-cols-3 gap-1 pt-0.5 text-center">
            {[
              { who: isEn ? 'Wife' : 'الزوجة', share: '1/8' },
              { who: isEn ? 'Father' : 'الأب', share: '1/6' },
              { who: isEn ? 'Son' : 'الابن', share: isEn ? 'Residue' : 'الباقي' },
            ].map((heir, idx) => (
              <div
                key={idx}
                className="rounded-lg py-1 px-1"
                style={{ backgroundColor: palette.recessedBg }}
              >
                <div className="text-[7px] font-bold opacity-80">{heir.who}</div>
                <div className="text-[8.5px] font-black font-mono" style={{ color: palette.primaryAccent }}>
                  {heir.share}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface StorePosterStageProps {
  spec: StoreScreenshotSpec;
  themeId: StudioThemeId;
  lang: StudioLang;
  stageRef?: React.Ref<HTMLDivElement>;
}

/**
 * Exact 360x640 (9:16) Google Play Store Poster Stage.
 * When captured at pixelRatio: 3, produces crisp 1080x1920 PNG.
 */
export const StorePosterStage: React.FC<StorePosterStageProps> = ({
  spec,
  themeId,
  lang,
  stageRef,
}) => {
  const palette = STUDIO_THEMES[themeId];
  const isEn = lang === 'en';
  const dir = isEn ? 'ltr' : 'rtl';
  const title = isEn ? spec.titleEn : spec.titleAr;
  const subtitle = isEn ? spec.subtitleEn : spec.subtitleAr;
  const badgeText = isEn ? spec.labelEn : spec.labelAr;

  return (
    <div
      ref={stageRef}
      dir={dir}
      className="relative overflow-hidden select-none font-cairo flex flex-col items-center justify-between"
      style={{
        width: '360px',
        height: '640px',
        background: palette.posterBg,
        fontFamily: 'var(--font-cairo)',
      }}
    >
      {/* Ambient Radial Halo Behind Phone */}
      <div
        className="absolute left-1/2 -translate-x-1/2 top-[115px] w-[320px] h-[320px] rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.posterGlow} 0%, rgba(0,0,0,0) 70%)`,
        }}
      />

      {/* Subtle Corner Geometric Accent */}
      <div
        className="absolute inset-3 rounded-2xl pointer-events-none"
        style={{
          border: '1px solid rgba(255,255,255,0.12)',
        }}
      />

      {/* Top Editorial Store Headline Section */}
      <div className="relative z-10 w-full px-5 pt-5 pb-2 flex flex-col items-center text-center gap-1.5 shrink-0">
        <span
          className="px-3 py-0.5 rounded-full text-[9.5px] font-black tracking-wide"
          style={{
            backgroundColor: palette.posterBadgeBg,
            color: palette.posterBadgeText,
            border: '1px solid rgba(255,255,255,0.18)',
          }}
        >
          {badgeText}
        </span>

        <h3
          className="text-[16px] font-black leading-[1.35] px-1"
          style={{
            color: palette.posterTitleColor,
            textShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {title}
        </h3>

        <p
          className="text-[10.5px] font-bold leading-snug opacity-95 px-2"
          style={{ color: palette.posterSubtitleColor }}
        >
          {subtitle}
        </p>
      </div>

      {/* Bottom 3D Smartphone Frame Holding Real Live App Screen */}
      <div className="relative z-10 w-full flex-1 flex items-end justify-center px-6 pb-3 pt-1 min-h-0">
        <div
          className="w-[258px] h-[466px] rounded-[34px] p-[8px] flex flex-col relative"
          style={{
            background: palette.phoneBezelBg,
            border: `2px solid ${palette.phoneBorderColor}`,
            boxShadow:
              '0 22px 44px -8px rgba(0, 0, 0, 0.65), 0 8px 18px rgba(0,0,0,0.4), inset 0 1.5px 2px rgba(255,255,255,0.32)',
          }}
        >
          {/* Phone Screen Inner Canvas */}
          <div
            className="w-full h-full rounded-[26px] overflow-hidden flex flex-col relative"
            style={{
              backgroundColor: palette.isDark ? '#000000' : '#FFFFFF',
            }}
          >
            {/* Realistic Phone Status Bar + Dynamic Notch */}
            <div
              className="w-full h-[20px] px-4 flex items-center justify-between text-[8px] font-bold shrink-0 relative"
              dir="ltr"
              style={{
                backgroundColor: palette.isDark ? '#09090B' : (spec.id === 'lens' ? '#09090B' : '#FFFFFF'),
                color: palette.isDark || spec.id === 'lens' ? '#FFFFFF' : '#0F172A',
              }}
            >
              <span>9:41</span>
              <div
                className="w-[62px] h-[11px] rounded-full bg-black absolute left-1/2 -translate-x-1/2 top-[4px]"
                style={{ boxShadow: 'inset 0 0 2px rgba(255,255,255,0.2)' }}
              />
              <span className="flex items-center gap-1">
                <span>5G</span>
                <span>100%</span>
              </span>
            </div>

            {/* Live Screen Body */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <LivePhoneScreenContent
                screenId={spec.id}
                palette={palette}
                lang={lang}
              />
            </div>

            {/* Realistic Bottom Gesture Pill */}
            <div
              className="w-full h-[12px] flex items-center justify-center shrink-0"
              style={{
                backgroundColor: palette.isDark
                  ? '#000000'
                  : spec.id === 'lens'
                  ? '#09090B'
                  : spec.id === 'home'
                  ? palette.homeScreenBg
                  : spec.id === 'quran'
                  ? palette.mushafPaperBg
                  : palette.phoneScreenBg,
              }}
            >
              <div
                className="w-20 h-[3px] rounded-full opacity-35"
                style={{
                  backgroundColor: palette.isDark || spec.id === 'lens' ? '#FFFFFF' : '#0F172A',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
