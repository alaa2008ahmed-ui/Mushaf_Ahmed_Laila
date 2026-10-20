import React from 'react';
import { 
  Play, Pause, Bookmark, Share2, Menu, ChevronDown, 
  RotateCcw, Search, Headphones, Mic, Volume2, 
  Compass, Clock, Calendar, Settings, Palette, 
  SkipForward, SkipBack, Copy, Plus, BookOpen,
  MessageCircle, Trophy, Bell, Moon, Sliders,
  Heart, FileText, Shield, Globe, Calculator, Sparkles,
  CheckCircle2, Crown, RotateCw, Minus, ArrowUpRight, 
  ChevronLeft, ChevronRight, Info, Check, MapPin, 
  VolumeX, Star, Download, Send, Paperclip, 
  Smile, UserCheck, Flame, BookCheck, Award, 
  TrendingUp, History, Eye, EyeOff, CheckSquare, 
  Square, RefreshCw, Layers, Trash2, LayoutGrid, BarChart3,
  List, Shirt, Wand2, Droplet, Waves, DoorOpen, Bath,
  LogOut, ArrowRightSquare, Navigation, Map,
  User, CheckCircle, Repeat, ArrowLeftRight, HelpCircle, ListFilter,
  Home, Phone, ExternalLink, Tent, Ban, ShieldAlert, SlidersHorizontal, ZoomIn
} from 'lucide-react';
import { ButtonExplanationData } from './ButtonExplanationModal';
import { useLanguage } from '../../context/LanguageContext';
import { translateExplanationData, translateTree, tGuide } from './pageGuideTranslations';

interface PageMockupProps {
  onInspect: (data: ButtonExplanationData) => void;
  theme: any;
  themeKey?: string;
  isBlackTheme: boolean;
  primaryAccent: string;
  textColor: string;
  cardBg: string;
  cardBorderColor: string;
}

// -------------------------------------------------------------
// عنصر تفاعلي نظيف بدون أي نقاط برتقالية أو عناصر مشوهة للتصميم
// -------------------------------------------------------------
export const Hotspot: React.FC<{
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ onClick, children, className = '', title }) => {
  const { language } = useLanguage();
  const defaultTitle = language === 'en' ? "Tap to view button explanation" : "اضغط لعرض شرح هذا الزر";
  const finalTitle = title ? (language === 'en' ? tGuide(title, 'en') : title) : defaultTitle;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      title={finalTitle}
      className={`cursor-pointer transition-all duration-150 hover:opacity-90 active:scale-[0.98] select-none ${className}`}
    >
      {children}
    </div>
  );
};

// =============================================================
// 1. صفحة السبحة الإلكترونية (Tasbeeh) - مطابقة 100% للصورة الأصلية
// =============================================================
export const TasbeehMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-3 py-2 select-none" dir="rtl">
      
      {/* 1. بطاقة الذكر الحالي: سبحان الله */}
      <Hotspot
        className="w-full"
        onClick={() => onInspect({
          title: 'صندوق الذكر الحالي',
          purpose: 'يعرض صيغة الذكر أو التسبيح المختار حالياً، وبالنقر عليه في الصفحة الأصلية يمكنك الاختيار من قائمة الأذكار المأثورة المدمجة أو إضافة أذكارك وأورادك الخاصة، كما يمكنك السحب يميناً ويساراً للتنقل السريع بين الأذكار.'
        })}
      >
        <div 
          className="rounded-2xl border-2 shadow-sm p-3.5 text-center w-full transition-all"
          style={{
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
            color: textColor
          }}
        >
          <span className="text-xl sm:text-2xl font-black font-amiri block">
            سبحان الله
          </span>
        </div>
      </Hotspot>

      {/* 2. شريط الأزرار الخمسة (إضافة، حذف، لون العداد، شكل العداد، الرسم البياني) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2 w-full h-16">
        <Hotspot
          onClick={() => onInspect({
            title: 'زر إضافة ذكر مخصص',
            purpose: 'يتيح لك كتابة أي ذكر أو تسبيح أو دعاء شخصي تريده وتحديد عدد مرات التكرار والهدف المستهدف له ليضاف فوراً إلى قائمة أذكارك الخاصة.'
          })}
        >
          <div 
            className="flex flex-col items-center justify-center p-1 font-bold rounded-xl border-2 shadow-xs text-[11px] sm:text-xs h-full"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            <span>إضافة</span>
          </div>
        </Hotspot>

        <Hotspot
          onClick={() => onInspect({
            title: 'زر حذف الذكر',
            purpose: 'يتيح لك حذف أي ذكر مخصص قمت بإضافته سابقاً بسهولة عند عدم رغبتك في بقائه بقائمة الأذكار.'
          })}
        >
          <div 
            className="flex flex-col items-center justify-center p-1 font-bold rounded-xl border-2 shadow-xs text-[11px] sm:text-xs h-full"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            <span>حذف</span>
          </div>
        </Hotspot>

        <Hotspot
          onClick={() => onInspect({
            title: 'زر لون العداد',
            purpose: 'يتيح لك تخصيص وتغيير لون حلقة وزر عداد التسبيح بما يناسب ذوقك وراحة عينيك من بين باقة ألوان أنيقة ومتنوعة.'
          })}
        >
          <div 
            className="flex flex-col items-center justify-center p-1 font-bold rounded-xl border-2 shadow-xs text-[11px] sm:text-xs h-full"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            <Palette className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            <span>لون العداد</span>
          </div>
        </Hotspot>

        <Hotspot
          onClick={() => onInspect({
            title: 'زر شكل العداد',
            purpose: 'يتيح لك التبديل بين 3 أشكال وتصاميم مختلفة للسبحة: المظهر العصري الرقمي، أو مظهر السبحة الكلاسيكية، أو مظهر حبات السبحة الدائرية الواقعية مع حركة الانزلاق.'
          })}
        >
          <div 
            className="flex flex-col items-center justify-center p-1 font-bold rounded-xl border-2 shadow-xs text-[11px] sm:text-xs h-full"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 mb-1" />
            <span>شكل العداد</span>
          </div>
        </Hotspot>

        <Hotspot
          onClick={() => onInspect({
            title: 'زر الرسم البياني',
            purpose: 'يفتح رسماً بيانياً تحليلياً يوضح تطور عدد تسبيحاتك وإنجازك اليومي والشهري ومتابعة مداومتك على ذكر الله.'
          })}
        >
          <div 
            className="flex flex-col items-center justify-center p-1 font-bold rounded-xl border-2 shadow-xs text-[11px] sm:text-xs h-full"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mb-1 text-amber-500" />
            <span>الرسم البياني</span>
          </div>
        </Hotspot>
      </div>

      {/* 3. بطاقة الهدف الرقمي: ٣٣ */}
      <Hotspot
        className="w-full max-w-sm mt-2"
        onClick={() => onInspect({
          title: 'بطاقة الهدف الرقمي',
          purpose: 'توضح عدد التسبيحات المستهدف إنجازها في الجلسة الحالية (مثل 33 أو 100 تسبيحة)، وعند بلوغ هذا الرقم ينبهك التطبيق فوراً بنغمة هادئة واهتزاز تفاعلي.'
        })}
      >
        <div 
          className="rounded-2xl border-2 shadow-sm py-3 px-6 text-center w-full"
          style={{
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
            color: textColor
          }}
        >
          <span className="block text-sm font-bold opacity-75 mb-0.5">الهدف:</span>
          <span className="text-4xl sm:text-5xl font-extrabold font-amiri block">٣٣</span>
        </div>
      </Hotspot>

      {/* 4. زر التسبيح والعد الذكي الكبير */}
      <Hotspot
        className="my-3 sm:my-5"
        onClick={() => onInspect({
          title: 'زر التسبيح والعد الذكي',
          purpose: 'الزر الرئيسي للعد؛ عند الضغط عليه في الصفحة الأصلية يزيد العداد بمقدار 1 مع اهتزاز لمسي خفيف يحاكي ملمس حبات السبحة الحقيقية وصوت نقرة هادئ ومريح.'
        })}
      >
        <div className="w-52 h-52 sm:w-60 sm:h-60 rounded-full border-[3px] border-emerald-500/30 flex items-center justify-center p-2">
          <div 
            className="w-44 h-44 sm:w-50 sm:h-50 rounded-full shadow-lg border flex flex-col items-center justify-center gap-2.5 transition-transform"
            style={{
              backgroundColor: isBlackTheme ? '#1a1a1a' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)',
              color: textColor
            }}
          >
            <div className="w-3.5 h-3.5 bg-black dark:bg-white rotate-45 transform rounded-xs shadow-xs"></div>
            <span className="text-sm sm:text-base font-bold opacity-85">اضغط للعد</span>
          </div>
        </div>
      </Hotspot>

      {/* 5. زرا تعديل الهدف والتصفير */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-sm sm:max-w-md mt-1">
        <Hotspot
          onClick={() => onInspect({
            title: 'زر تعديل الهدف',
            purpose: 'يتيح لك تغيير العدد المستهدف للتسبيح واختيار أرقام جاهزة (33، 100، 1000) أو إدخال أي رقم تريده، أو جعله مفتوحاً بدون حد.'
          })}
        >
          <div 
            className="py-3 px-4 rounded-2xl border-2 text-center font-bold text-base shadow-xs"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            تعديل الهدف
          </div>
        </Hotspot>

        <Hotspot
          onClick={() => onInspect({
            title: 'زر تصفير العداد',
            purpose: 'يقوم بإعادة عداد الجلسة الحالية إلى الصفر للبدء من جديد مع الاحتفاظ التلقائي بإجمالي تسبيحاتك في سجل الإحصائيات الدائم.'
          })}
        >
          <div 
            className="py-3 px-4 rounded-2xl border-2 text-center font-bold text-base shadow-xs"
            style={{
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
              color: textColor
            }}
          >
            تصفير
          </div>
        </Hotspot>
      </div>

      {/* 6. بطاقة الرسم البياني وتطور التسبيح أسبوعي وشهري */}
      <Hotspot
        className="w-full max-w-sm sm:max-w-md mt-2"
        onClick={() => onInspect({
          title: 'بطاقة التطور الأسبوعي والشهري',
          purpose: 'تعرض تقريراً ومخططاً بيانياً شاملاً لتطورك في التسبيح عبر الأيام والأسابيع لتشجيعك على المداومة والاستمرار في ذكر الله عز وجل.'
        })}
      >
        <div 
          className="p-3 px-4 rounded-2xl border-2 shadow-xs flex items-center justify-between text-xs sm:text-sm font-bold"
          style={{
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff',
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
            color: textColor
          }}
        >
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-amber-500">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span>الرسم البياني وتطور التسبيح أسبوعي وشهري</span>
          </div>
          <ChevronLeft className="w-4 h-4 opacity-60" />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 2. صفحة مجتمع التواصل (Community) - مطابقة 100% للصورة المرفقة
// =============================================================
export const CommunityMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. شريط التبويبات الأربعة */}
      <Hotspot onClick={() => onInspect({
        title: 'تبويبات مجتمع التواصل',
        purpose: 'تتيح لك التنقل السلس بين أقسام المجتمع الأربعة: المحادثات مع الأصدقاء، الغرف والمجموعات العامة في المجتمع، استعراض قائمة الأعضاء، وإدارة قائمة الحظر.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-center">
            الأصدقاء
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            المجتمع
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            الأعضاء
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            الحظر
          </div>
        </div>
      </Hotspot>

      {/* 2. شريط البحث وزر التحديث */}
      <div className="flex items-center gap-2">
        <Hotspot 
          className="flex-1"
          onClick={() => onInspect({
            title: 'خانة البحث عن الأصدقاء والقُرّاء',
            purpose: 'تتيح لك البحث بالاسم أو الدولة عن أي صديق أو قارئ داخل مجتمع التطبيق لبدء محادثة فورية معه أو إضافته لقائمتك.'
          })}
        >
          <div 
            className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm opacity-80 shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="truncate">ابحث عن أصدقاء وقُرّاء بالاسم أو الدولة أو...</span>
            <Search size={18} className="opacity-60 shrink-0" />
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر تحديث المحادثات',
          purpose: 'يقوم بإعادة تحميل وجلب أحدث الرسائل والمحادثات وقائمة الأصدقاء فورياً من الخادم للتأكد من وصول كل جديد.'
        })}>
          <div 
            className="w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
          >
            <RotateCw size={18} />
          </div>
        </Hotspot>
      </div>

      {/* 3. بطاقة محادثة الدعم الفني (الإدارة) */}
      <Hotspot onClick={() => onInspect({
        title: 'محادثة الدعم الفني وإدارة التطبيق',
        purpose: 'قناة مباشرة للتواصل الفوري مع إدارة ومشرفي التطبيق لطرح الاقتراحات، الإبلاغ عن أي مشكلة، أو طلب المساعدة على مدار الساعة.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-xs relative"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full border border-black/10 flex items-center justify-center overflow-hidden bg-amber-50">
                <BookOpen size={24} className="text-amber-700" />
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 left-0"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base font-kufi">الدعم الفني</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  (الإدارة 🛡️)
                </span>
              </div>
              <p className="text-xs opacity-75 truncate mt-0.5 font-bold">
                تواصل مع إدارة التطبيق للدعم الفنى والشكاوى...
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono opacity-60 shrink-0 mr-1">٠٣:٠٠ م</span>
        </div>
      </Hotspot>

      {/* 4. بطاقة محادثة صديق (اسم افتراضي) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة المحادثة الخاصة مع الصديق',
        purpose: 'تفتح نافذة الشات المباشر مع الصديق أو العضو لتبادل الرسائل النصية، مقاطع الصوت، الآيات القرآنية، وتبادل التواصي بالحق والخير.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-xs relative"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-12 h-12 rounded-full border border-black/10 overflow-hidden bg-blue-100 flex items-center justify-center font-black text-sm text-blue-700">
                ع.م
              </div>
              <span className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 left-0"></span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base">أحمد علي</span>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                  (عضو متفاعل 🌐)
                </span>
              </div>
              <p className="text-xs opacity-75 truncate mt-0.5 font-bold">السلام عليكم ورحمة الله وبركاته</p>
            </div>
          </div>
          <span className="text-[11px] font-mono opacity-60 shrink-0 mr-1">١١:٠٨ م</span>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 3. صفحة الأدعية المأثورة (Adia) - مطابقة 100% للصورة المرفقة
// =============================================================
export const AdiaMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none relative" dir="rtl">
      
      {/* 1. خانة البحث في الأدعية */}
      <Hotspot onClick={() => onInspect({
        title: 'خانة البحث في الأدعية',
        purpose: 'تتيح لك كتابة أي كلمة أو مناسبة للبحث الفوري في مئات الأدعية القرآنية والنبوية المأثورة والوصول السريع للدعاء المناسب.'
      })}>
        <div 
          className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm opacity-80 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span>ابحث في الأدعية...</span>
          <Search size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 2. بطاقة الدعاء الأول */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        <div className="flex items-center justify-between">
          <Hotspot onClick={() => onInspect({ title: 'عداد تكرار الدعاء', purpose: 'يوضح رقم وعدد مرات تكرار قراءة هذا الدعاء لنيل عظيم الأجر والثواب.' })}>
            <div className="w-8 h-8 rounded-full border border-black/15 dark:border-white/20 flex items-center justify-center font-bold text-xs">
              ١
            </div>
          </Hotspot>
          <Hotspot onClick={() => onInspect({ title: 'شارة عدد المرات المستحبة', purpose: 'توضح هدي النبي ﷺ في عدد مرات قول هذا الدعاء (هنا: يُقرأ مرة واحدة).' })}>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
              يُقرأ مرة واحدة
            </span>
          </Hotspot>
        </div>

        <Hotspot onClick={() => onInspect({
          title: 'نص الدعاء القرآني المأثور',
          purpose: 'نص الدعاء المبارك من كتاب الله العزيز، مشكولاً بالرسم العثماني ليسهل تلاوته وترديده بخشوع.'
        })}>
          <p className="text-base sm:text-lg font-amiri font-black text-center leading-relaxed py-1">
            رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
          </p>
        </Hotspot>

        <Hotspot onClick={() => onInspect({ title: 'مصدر وتخريج الدعاء', purpose: 'يوضح سورة القرآن الكريم ورقم الآية الكريمة أو كتاب الحديث النبوي المخرج فيه هذا الدعاء.' })}>
          <div className="text-center">
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 opacity-80 inline-block">
              أدعية من القرآن الكريم • سورة البقرة: 201
            </span>
          </div>
        </Hotspot>

        {/* أزرار الإجراءات الخمسة السفلية */}
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 px-2">
          <Hotspot onClick={() => onInspect({ title: 'زر الاستماع الصوتي للدعاء', purpose: 'يشغل تسجيلاً صوتياً نقياً بصوت شيخ متقن لنطق هذا الدعاء بالتشكيل الصحيح.' })}>
            <div className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"><Volume2 size={18} /></div>
          </Hotspot>
          <Hotspot onClick={() => onInspect({ title: 'زر مشاركة الدعاء', purpose: 'يشارك نص الدعاء مع تخريجه كرسالة أو صورة مصممة لأصدقائك عبر تطبيقات التواصل.' })}>
            <div className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"><Share2 size={18} /></div>
          </Hotspot>
          <Hotspot onClick={() => onInspect({ title: 'زر نسخ نص الدعاء', purpose: 'ينسخ نص الدعاء وتخريجه إلى الحافظة للصقه في أي مكان بسهولة.' })}>
            <div className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"><Copy size={18} /></div>
          </Hotspot>
          <Hotspot onClick={() => onInspect({ title: 'زر تكبير الخط والقراءة', purpose: 'يفتح نافذة قراءة مكبرة بملء الشاشة مع إمكانية تكبير وتصغير حجم الخط بما يريح العين.' })}>
            <div className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"><Search size={18} /></div>
          </Hotspot>
          <Hotspot onClick={() => onInspect({ title: 'زر إضافة الدعاء للمفضلة', purpose: 'يحفظ هذا الدعاء في قائمة أدعيتك المفضلة للرجوع السريع إليه في أي وقت.' })}>
            <div className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"><Heart size={18} /></div>
          </Hotspot>
        </div>
      </div>

      {/* 3. بطاقة الدعاء الثاني */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 rounded-full border border-black/15 dark:border-white/20 flex items-center justify-center font-bold text-xs">١</div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">يُقرأ مرة واحدة</span>
        </div>
        <p className="text-base sm:text-lg font-amiri font-black text-center leading-relaxed py-1">
          رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنتَ السَّمِيعُ الْعَلِيمُ
        </p>
        <div className="text-center">
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 opacity-80 inline-block">
            أدعية من القرآن الكريم • سورة البقرة: 127
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 px-2">
          <div className="p-2"><Volume2 size={18} /></div>
          <div className="p-2"><Share2 size={18} /></div>
          <div className="p-2"><Copy size={18} /></div>
          <div className="p-2"><Search size={18} /></div>
          <div className="p-2"><Heart size={18} /></div>
        </div>
      </div>

      {/* زر الفهرس العائم أسفل اليسار/اليمين */}
      <Hotspot 
        className="fixed bottom-6 left-6 sm:left-10 z-20"
        onClick={() => onInspect({
          title: 'زر الفهرس السريع والتصنيفات',
          purpose: 'يفتح قائمة جانبية سريعة بجميع أبواب وتصنيفات الأدعية المأثورة (أدعية القرآن، أدعية الأنبياء، أدعية الشفاء، تفريج الكرب) للقفز الفوري إليها.'
        })}
      >
        <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-xl">
          <List size={22} />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 4. صفحة أذكار الصلوات (AthkarAlSalah) - مطابقة 100% للصورة المرفقة
// =============================================================
export const AthkarAlSalahMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  const prayers = [
    { name: 'صلاة الفجر', icon: <Compass size={20} className="text-emerald-600" />, desc: 'أذكار وتسابيح ما بعد صلاة الصبح وسنة الفجر.' },
    { name: 'صلاة الظهر', icon: <Settings size={20} className="text-amber-500" />, desc: 'أذكار ما بعد صلاة الظهر والاستغفار المأثور.' },
    { name: 'صلاة العصر', icon: <Sparkles size={20} className="text-amber-600" />, desc: 'أذكار ما بعد صلاة العصر حتى الغروب.' },
    { name: 'صلاة المغرب', icon: <Moon size={20} className="text-blue-500" />, desc: 'أذكار ما بعد صلاة المغرب ودعاء الإفطار.' },
    { name: 'صلاة العشاء', icon: <Star size={20} className="text-indigo-500" />, desc: 'أذكار ما بعد صلاة العشاء والوتر وقيام الليل.' },
  ];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none relative" dir="rtl">
      
      {/* بطاقات الصلوات الخمس */}
      {prayers.map((prayer, idx) => (
        <Hotspot 
          key={prayer.name}
          onClick={() => onInspect({
            title: `بطاقة أذكار ${prayer.name}`,
            purpose: `تفتح قائمة الأذكار والأدعية والتسبيحات المسنونة عن النبي ﷺ عقب الانتهاء من ${prayer.name}، مع عداد تفاعلي لكل ذكر.`
          })}
        >
          <div 
            className="p-3.5 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs"
            style={{ 
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
              borderColor: idx % 2 === 0 ? '#10b981' : (isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000'),
              color: textColor 
            }}
          >
            <ChevronLeft size={18} className="opacity-60" />
            <span className="font-black text-base font-kufi">{prayer.name}</span>
            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center">
              {prayer.icon}
            </div>
          </div>
        </Hotspot>
      ))}

      {/* بطاقة سنن الصلوات (الرواتب) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة سنن الصلوات الرواتب اليومية (12 ركعة)',
        purpose: 'تعرض جدول السنن الرواتب المؤكدة التي داوم عليها النبي ﷺ مع كل فريضة (12 ركعة يومياً بنى الله لمن صلاها بيتاً في الجنة).'
      })}>
        <div 
          className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-2 mt-1"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: '#10b981',
            color: textColor 
          }}
        >
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-black text-sm font-kufi">
            <span>سنن الصلوات (الرواتب)</span>
            <span>🕌</span>
          </div>

          <div className="space-y-1.5 text-xs font-bold pt-1">
            <div className="flex justify-between items-center opacity-85">
              <span>صلاة الفجر:</span>
              <span>2 ركعة قبلية</span>
            </div>
            <div className="flex justify-between items-center opacity-85">
              <span>صلاة الظهر:</span>
              <span>4 قبلية و 2 بعدية</span>
            </div>
            <div className="flex justify-between items-center opacity-85">
              <span>صلاة العصر:</span>
              <span className="opacity-60">ليس لها سنة راتبة</span>
            </div>
            <div className="flex justify-between items-center opacity-85">
              <span>صلاة المغرب:</span>
              <span>2 ركعة بعدية</span>
            </div>
            <div className="flex justify-between items-center opacity-85">
              <span>صلاة العشاء:</span>
              <span>2 ركعة بعدية</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* زر الفهرس العائم */}
      <Hotspot 
        className="fixed bottom-6 left-6 z-20"
        onClick={() => onInspect({
          title: 'زر الفهرس السريع',
          purpose: 'يتيح الانتقال السريع بين أذكار الصلوات الخمس والسنن الرواتب بنقرة واحدة.'
        })}
      >
        <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-xl">
          <List size={22} />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 5. صفحة حصن المسلم (HisnAlmuslim) - مطابقة 100% للصورة المرفقة
// =============================================================
export const HisnAlmuslimMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  const categories = [
    { name: 'أذكار الاستيقاظ من النوم', icon: <Settings size={22} /> },
    { name: 'دعاء لبس الثوب', icon: <Shirt size={22} /> },
    { name: 'دعاء لبس الثوب الجديد', icon: <Wand2 size={22} /> },
    { name: 'الدعاء لمن لبس ثوبا جديدا', icon: <UserCheck size={22} /> },
    { name: 'ما يقول إذا وضع ثوبه', icon: <RotateCcw size={22} /> },
    { name: 'دعاء دخول الخلاء', icon: <Bath size={22} /> },
    { name: 'دعاء الخروج من الخلاء', icon: <DoorOpen size={22} /> },
    { name: 'الذكر قبل الوضوء', icon: <Droplet size={22} /> },
    { name: 'الذكر بعد الفراغ من الوضوء', icon: <Waves size={22} /> },
    { name: 'الذكر عند الخروج من المنزل', icon: <ArrowRightSquare size={22} /> },
  ];

  return (
    <div className="w-full max-w-md mx-auto py-1 select-none relative" dir="rtl">
      
      {/* شبكة البطاقات بعمودين */}
      <div className="grid grid-cols-2 gap-2.5">
        {categories.map((cat) => (
          <Hotspot
            key={cat.name}
            onClick={() => onInspect({
              title: `قسم: ${cat.name}`,
              purpose: `يفتح جميع الأدعية والأذكار الصحيحة المأثورة الواردة في كتاب حصن المسلم بخصوص (${cat.name}) مع عدد المرات وفضل كل ذكر وسنده.`
            })}
          >
            <div 
              className="p-4 rounded-3xl border-2 flex flex-col items-center justify-center gap-2.5 text-center min-h-[125px] shadow-xs"
              style={{ 
                backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
                borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000',
                color: textColor 
              }}
            >
              <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center opacity-85">
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-black font-kufi leading-snug">
                {cat.name}
              </span>
            </div>
          </Hotspot>
        ))}
      </div>

      {/* زر القائمة العائم */}
      <Hotspot 
        className="fixed bottom-6 left-6 z-20"
        onClick={() => onInspect({
          title: 'زر الفهرس الشامل لحصن المسلم',
          purpose: 'يفتح الفهرس الكامل المبوب لأكثر من 130 باباً ومناسبة من أبواب كتاب حصن المسلم للبحث السريع والانتقال المباشر.'
        })}
      >
        <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-xl">
          <List size={22} />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 6. صفحة التقويم (HijriCalendar) - مطابقة 100% للصورة المرفقة
// =============================================================
export const CalendarMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. التبويب العلوي: عرض التقويم / محول التاريخ */}
      <Hotspot onClick={() => onInspect({
        title: 'شريط التبديل بين التقويم ومحول التاريخ',
        purpose: 'يتيح لك التبديل بين عرض شبكة التقويم الهجري والميلادي للشهر الحالي، أو الانتقال لأداة التحويل الدقيق بين التاريخ الهجري والميلادي لأي يوم.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-2 px-3 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center gap-1.5 font-black">
            <Calendar size={16} />
            <span>عرض التقويم</span>
          </div>
          <div className="flex-1 py-2 px-3 flex items-center justify-center gap-1.5 opacity-70">
            <RotateCcw size={16} />
            <span>محول التاريخ</span>
          </div>
        </div>
      </Hotspot>

      {/* 2. بطاقة شبكة التقويم للشهر */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        {/* شريط رأس الشهر والتنقل */}
        <div className="flex items-center justify-between">
          <Hotspot onClick={() => onInspect({ title: 'زر الشهر السابق', purpose: 'يعرض تقويم الشهر السابق مع كامل مواعيده ومناسباته الإسلامية.' })}>
            <div className="p-1 rounded-lg border hover:bg-black/5"><ChevronLeft size={18} /></div>
          </Hotspot>
          <div className="text-center">
            <h3 className="font-black text-base font-kufi">أكتوبر ٢٠٢٦</h3>
            <p className="text-xs opacity-75 font-bold">جمادى الأولى ١٤٤٨ هـ</p>
          </div>
          <Hotspot onClick={() => onInspect({ title: 'زر الشهر التالي', purpose: 'يعرض تقويم الشهر القادم مع كامل مواعيده ومناسباته الإسلامية.' })}>
            <div className="p-1 rounded-lg border hover:bg-black/5"><ChevronRight size={18} /></div>
          </Hotspot>
        </div>

        {/* أسماء أيام الأسبوع */}
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold opacity-60 py-1 border-b border-black/5 dark:border-white/5">
          <span>الأحد</span>
          <span>الإثنين</span>
          <span>الثلاثاء</span>
          <span>الأربعاء</span>
          <span>الخميس</span>
          <span>الجمعة</span>
          <span>السبت</span>
        </div>

        {/* شبكة الأيام 7x5 */}
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {[
            { g: '٢٧', h: '١٦', muted: true }, { g: '٢٨', h: '١٧', muted: true }, { g: '٢٩', h: '١٨', muted: true }, { g: '٣٠', h: '١٩', muted: true }, { g: '١', h: '٢٠' }, { g: '٢', h: '٢١' }, { g: '٣', h: '٢٢' },
            { g: '٤', h: '٢٣' }, { g: '٥', h: '٢٤' }, { g: '٦', h: '٢٥' }, { g: '٧', h: '٢٦' }, { g: '٨', h: '٢٧' }, { g: '٩', h: '٢٨' }, { g: '١٠', h: '٢٩' },
            { g: '١١', h: '٣٠' }, { g: '١٢', h: '١' }, { g: '١٣', h: '٢' }, { g: '١٤', h: '٣' }, { g: '١٥', h: '٤' }, { g: '١٦', h: '٥', current: true }, { g: '١٧', h: '٦' },
            { g: '١٨', h: '٧' }, { g: '١٩', h: '٨' }, { g: '٢٠', h: '٩' }, { g: '٢١', h: '١٠' }, { g: '٢٢', h: '١١' }, { g: '٢٣', h: '١٢' }, { g: '٢٤', h: '١٣' },
            { g: '٢٥', h: '١٤' }, { g: '٢٦', h: '١٥' }, { g: '٢٧', h: '١٦' }, { g: '٢٨', h: '١٧' }, { g: '٢٩', h: '١٨' }, { g: '٣٠', h: '١٩' }, { g: '٣١', h: '٢٠' },
          ].map((day, idx) => (
            <Hotspot
              key={idx}
              onClick={() => onInspect({
                title: `يوم ${day.g} أكتوبر (${day.h} جمادى الأولى)`,
                purpose: `يعرض تفاصيل هذا اليوم، مواقيت الصلاة الخاصة به، المناسبات الإسلامية والوطنية، وأوقات صيام الأيام البيض والاثنين والخميس.`
              })}
            >
              <div 
                className={`py-1.5 px-0.5 rounded-xl border flex flex-col items-center justify-center text-xs font-bold transition-all ${
                  day.current 
                    ? 'bg-black text-white dark:bg-white dark:text-black font-black shadow-md' 
                    : (day.muted ? 'opacity-30 border-transparent' : 'border-black/10 dark:border-white/10 hover:border-black/30')
                }`}
              >
                <span className="text-xs">{day.g}</span>
                <span className="text-[10px] opacity-75">{day.h}</span>
              </div>
            </Hotspot>
          ))}
        </div>
      </div>

      {/* 3. بطاقة أبرز المناسبات هذا الشهر */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة أبرز المناسبات والأحداث الإسلامية',
        purpose: 'تعرض أهم المناسبات والأعياد الدينية والذكريات الإسلامية الواقعة في الشهر الحالي مثل صيام الأيام البيض، المولد النبوي، يوم عرفة، وبدايات الأشهر الحرم.'
      })}>
        <div 
          className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3 min-h-[130px] justify-center"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-5 bg-purple-600 rounded-full"></span>
            <h4 className="font-black text-sm font-kufi">أبرز المناسبات هذا الشهر</h4>
          </div>

          <div className="flex flex-col items-center justify-center gap-1.5 py-2 opacity-60">
            <Calendar size={28} />
            <span className="text-xs font-bold">لا توجد مناسبات مسجلة</span>
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 7. صفحة أذكار الصباح (AdkarSabahMasaa) - مطابقة 100% للصورة المرفقة
// =============================================================
export const SabahMasaaMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  const sabahAdhkar = [
    {
      text: 'أصبحنا وأصبح الملك لله، والحمد لله، لا إله إلا الله وحده لا شريك له، له الملك وله الحمد وهو على كل شيء قدير.',
      count: '١',
      repeatBadge: 'يُقرأ مرة واحدة',
      source: 'من أذكار الصباح المأثورة'
    },
    {
      text: 'اللهم بك أصبحنا، وبك أمسينا، وبك نحيا، وبك نموت، وإليك النشور.',
      count: '١',
      repeatBadge: 'يُقرأ مرة واحدة',
      source: 'من أذكار الصباح المأثورة'
    },
    {
      text: 'اللهم ما أصبح بي من نعمة أو بأحد من خلقك فمنك وحدك لا شريك لك، فلك الحمد ولك الشكر.',
      count: '١',
      repeatBadge: 'يُقرأ مرة واحدة',
      source: 'من أذكار الصباح المأثورة'
    }
  ];

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none relative" dir="rtl">
      
      {sabahAdhkar.map((dhikr, idx) => (
        <div 
          key={idx}
          className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <Hotspot onClick={() => onInspect({ title: 'عداد تكرار الذكر', purpose: 'عداد تفاعلي تنازلي؛ ينقص بمقدار 1 عند كل نقرة لتشجيعك على إتمام عدد مرات السنة النبوية بدقة.' })}>
              <div className="w-8 h-8 rounded-full border border-black/15 dark:border-white/20 flex items-center justify-center font-bold text-xs">
                {dhikr.count}
              </div>
            </Hotspot>

            <Hotspot onClick={() => onInspect({ title: 'شارة التكرار المستحب', purpose: 'توضح عدد مرات قراءة هذا الذكر المبارك في الصباح والمساء وفق الهدي النبوي الشريف.' })}>
              <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                {dhikr.repeatBadge}
              </span>
            </Hotspot>
          </div>

          <Hotspot onClick={() => onInspect({ title: 'نص ذكر الصباح المأثور', purpose: 'نص الذكر النبوي الشريف المحفوظ عن رسول الله ﷺ مشكولاً بدقة لترديده صباحاً واستجلاب الحفظ والبركة.' })}>
            <p className="text-base sm:text-lg font-amiri font-black text-center leading-relaxed py-1">
              {dhikr.text}
            </p>
          </Hotspot>

          <div className="text-center">
            <span className="text-[11px] font-bold opacity-70">
              {dhikr.source}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 px-2">
            <Hotspot onClick={() => onInspect({ title: 'زر الاستماع الصوتي للذكر', purpose: 'يشغل نطقاً صوتياً نقياً للذكر بالتشكيل والتنغيم الهادئ لمساعدتك على الحفظ والترديد.' })}>
              <div className="p-2 rounded-xl hover:bg-black/5"><Volume2 size={18} /></div>
            </Hotspot>
            <Hotspot onClick={() => onInspect({ title: 'زر مشاركة الذكر', purpose: 'مشاركة بطاقة الذكر مع أهلك وأصدقائك عبر واتساب ووسائل التواصل لنيل أجر التذكير.' })}>
              <div className="p-2 rounded-xl hover:bg-black/5"><Share2 size={18} /></div>
            </Hotspot>
            <Hotspot onClick={() => onInspect({ title: 'زر نسخ نص الذكر', purpose: 'نسخ نص الذكر مشكولاً إلى حافظة الهاتف.' })}>
              <div className="p-2 rounded-xl hover:bg-black/5"><Copy size={18} /></div>
            </Hotspot>
            <Hotspot onClick={() => onInspect({ title: 'زر تكبير الخط', purpose: 'فتح نافذة تكبير الخط وقراءة الذكر في وضع ملء الشاشة لراحة البصر.' })}>
              <div className="p-2 rounded-xl hover:bg-black/5"><Search size={18} /></div>
            </Hotspot>
            <Hotspot onClick={() => onInspect({ title: 'زر المفضلة', purpose: 'إضافة الذكر إلى أذكارك المفضلة للوصول السريع.' })}>
              <div className="p-2 rounded-xl hover:bg-black/5"><Heart size={18} /></div>
            </Hotspot>
          </div>
        </div>
      ))}

      {/* زر الفهرس العائم أسفل اليسار */}
      <Hotspot 
        className="fixed bottom-6 left-6 z-20"
        onClick={() => onInspect({
          title: 'زر الفهرس السريع لأذكار اليوم والليلة',
          purpose: 'يفتح قائمة التبديل السريع بين أذكار الصباح، أذكار المساء، وأذكار النوم والاستيقاظ بنقرة واحدة.'
        })}
      >
        <div className="w-12 h-12 rounded-full border-2 border-black dark:border-white bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shadow-xl">
          <List size={22} />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 8. صفحة مواقيت الصلاة (PrayerTimes) - مطابقة 100% للصورة المرفقة
// =============================================================
export const PrayerTimesMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. زرا المساجد القريبة والمواقيت الشهرية */}
      <div className="grid grid-cols-2 gap-2.5">
        <Hotspot onClick={() => onInspect({
          title: 'زر المساجد القريبة',
          purpose: 'يفتح خريطة تفاعلية لتحديد أقرب المساجد والجوامع المحيطة بموقعك الحالي مع مسارات الوصول إليها ومواعيد إقامة الصلاة بها.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-xs sm:text-sm shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <MapPin size={18} className="text-emerald-600" />
            <span>المساجد القريبة</span>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر المواقيت الشهرية',
          purpose: 'يعرض جدولاً تفصيلياً كاملاً لمواقيت الصلوات الخمس والشروق طوال الشهر الهجري والميلادي معاً.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-xs sm:text-sm shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <Calendar size={18} className="text-blue-500" />
            <span>المواقيت الشهرية</span>
          </div>
        </Hotspot>
      </div>

      {/* 2. شريط البحث عن المدينة أو المحافظة */}
      <div className="flex items-center gap-2">
        <Hotspot 
          className="flex-1"
          onClick={() => onInspect({
            title: 'خانة البحث عن مدينة أو دولة',
            purpose: 'تتيح لك البحث عن أي مدينة أو محافظة حول العالم وتعيين مواقيت الصلاة واتجاه القبلة لها فورياً.'
          })}
        >
          <div 
            className="p-2.5 px-3.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm opacity-80 shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <Search size={18} className="opacity-60" />
            <span>...عن مدينة أو محافظة</span>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر تنفيذ البحث',
          purpose: 'يقوم بتطبيق البحث وجلب إحداثيات المدينة المختارة وحساب مواقيتها الفلكية الدقيقة.'
        })}>
          <div 
            className="px-5 py-2.5 rounded-2xl border-2 font-black text-xs sm:text-sm shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            بحث
          </div>
        </Hotspot>
      </div>

      {/* 3. البطاقة الخضراء (العد التنازلي وساعات الليل) */}
      <div className="p-4 rounded-2xl bg-emerald-700 text-white shadow-md flex items-center justify-between">
        <Hotspot 
          className="text-right flex-1 border-l border-white/20 pl-3"
          onClick={() => onInspect({
            title: 'العد التنازلي للصلاة القادمة',
            purpose: 'يعرض الوقت المتبقي بالساعات والدقائق والثواني بدقة حية حتى موعد رفع أذان الفريضة القادمة.'
          })}
        >
          <p className="text-[11px] font-bold text-emerald-100">المتبقي على صلاة</p>
          <h4 className="text-base font-black font-kufi">العصر</h4>
          <span className="text-2xl font-black font-mono tracking-wider block mt-0.5">00:28:06</span>
        </Hotspot>

        <div className="flex items-center gap-3 pr-2 text-center text-[10px]">
          <Hotspot onClick={() => onInspect({ title: 'أول الليل', purpose: 'يبدأ من مغيب الشفق الأحمر ويعد بداية وقت صلاة العشاء وقيام الليل.' })}>
            <div>
              <div className="flex items-center justify-center gap-0.5"><Bell size={12} /><span>أول الليل</span></div>
              <span className="font-mono font-bold block mt-0.5">8:54 pm</span>
            </div>
          </Hotspot>

          <Hotspot onClick={() => onInspect({ title: 'منتصف الليل الشرعي', purpose: 'يحسب منتصف الليل الشرعي الدقيق بين غروب الشمس وطلوع الفجر (نهاية وقت العشاء الاختياري).' })}>
            <div>
              <div className="flex items-center justify-center gap-0.5"><Bell size={12} /><span>منتصف الليل</span></div>
              <span className="font-mono font-bold block mt-0.5">10:45 pm</span>
            </div>
          </Hotspot>

          <Hotspot onClick={() => onInspect({ title: 'الثلث الأخير من الليل', purpose: 'وقت النزول الإلهي واستجابة الدعاء والتهجد والاستغفار بالأسحار.' })}>
            <div>
              <div className="flex items-center justify-center gap-0.5"><Bell size={12} /><span>الثلث الأخير</span></div>
              <span className="font-mono font-bold block mt-0.5">12:37 am</span>
            </div>
          </Hotspot>
        </div>
      </div>

      {/* 4. شبكة الصلوات الست (الفجر، الشروق، الظهر، العصر، المغرب، العشاء) */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { name: 'الفجر', time: '4:20', period: 'am', iqama: '4:40 am', hasSliders: true },
          { name: 'الشروق', time: '5:39', period: 'am', iqama: null, hasSliders: false },
          { name: 'الظهر', time: '11:25', period: 'am', iqama: '11:40 am', hasSliders: true },
          { name: 'العصر', time: '2:44', period: 'pm', iqama: '2:54 pm', hasSliders: true, active: true },
          { name: 'المغرب', time: '5:11', period: 'pm', iqama: '5:21 pm', hasSliders: true },
          { name: 'العشاء', time: '6:41', period: 'pm', iqama: '6:56 pm', hasSliders: true },
        ].map((salah) => (
          <Hotspot 
            key={salah.name}
            onClick={() => onInspect({
              title: `بطاقة وقت ${salah.name}`,
              purpose: `توضح موعد دخول ${salah.name} بدقة، ووقت الإقامة بالمسجد، وبالنقر عليها في الصفحة الأصلية يمكنك تخصيص نغمة الأذان الخاصة بها وتفعيل تنبيه الإقامة والوضوء.`
            })}
          >
            <div 
              className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between shadow-xs min-h-[105px] ${
                salah.active ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : ''
              }`}
              style={{ 
                backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
                borderColor: salah.active ? '#10b981' : (isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000'),
                color: salah.active ? '#10b981' : textColor 
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-black text-sm sm:text-base font-kufi">{salah.name}</span>
                {salah.hasSliders && (
                  <div className="flex items-center gap-1.5">
                    <Sliders size={16} />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  </div>
                )}
              </div>

              <div className="text-center py-1">
                <span className="text-xs opacity-70 ml-1">{salah.period}</span>
                <span className="text-2xl font-black font-mono tracking-tight">{salah.time}</span>
              </div>

              {salah.iqama && (
                <div className="text-center">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-black/15 dark:border-white/20 inline-block opacity-80">
                    إقامة {salah.iqama}
                  </span>
                </div>
              )}
            </div>
          </Hotspot>
        ))}
      </div>

      {/* هامش التنبيه السفلي */}
      <p className="text-center text-[11px] font-bold opacity-60 mt-1">
        (يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)
      </p>

    </div>
  );
};

// =============================================================
// 9. صفحة اتجاه القبلة (Qibla) - مطابقة 100% للصورة المرفقة
// =============================================================
export const QiblaMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. أشرطة وأنماط بوصلة القبلة الأربعة */}
      <Hotspot onClick={() => onInspect({
        title: 'أنماط استعراض اتجاه القبلة',
        purpose: 'تتيح لك التبديل بين 4 أوضاع: البوصلة الرقمية الدوارة، القبلة المرئية على خريطة جوجل التفاعلية، القبلة بالواقع المعزز بالكاميرا (AR)، وتحديد القبلة بحركة الشمس والقمر والظلال.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs w-full"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="py-1.5 px-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-black">
            بوصلة
          </div>
          <div className="py-1.5 px-2 flex items-center gap-1 opacity-70">
            <Map size={14} />
            <span>المرئية</span>
          </div>
          <div className="py-1.5 px-2 flex items-center gap-1 opacity-70">
            <Eye size={14} />
            <span>الواقع معزز</span>
          </div>
          <div className="py-1.5 px-2 flex items-center gap-1 opacity-70 truncate">
            <span>الشمس وا...</span>
          </div>
        </div>
      </Hotspot>

      {/* 2. قرص البوصلة الكبير مع عقرب ومؤشر 244° */}
      <Hotspot 
        className="my-4"
        onClick={() => onInspect({
          title: 'قرص البوصلة المغناطيسية وعقرب القبلة',
          purpose: 'يتحرك تلقائياً مع دوران هاتفك بالاعتماد على مستشعرات التسارع والبوصلة المدمجة؛ عند توجيه رأس السهم الأسود نحو الشمال (ش) يكون خط القبلة باتجاه الكعبة المشرفة 244° بدقة تامة مع اهتزاز تأكيدي.'
        })}
      >
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-black/80 dark:border-white/80 flex items-center justify-center p-3 shadow-inner">
          {/* الاتجاهات الأربعة بالعربية */}
          <span className="absolute top-1 font-black text-sm">ش</span>
          <span className="absolute bottom-1 font-black text-sm">ج</span>
          <span className="absolute right-1 font-black text-sm">ق</span>
          <span className="absolute left-1 font-black text-sm">غ</span>

          {/* التدرجات والشرطات */}
          <div className="w-full h-full rounded-full border border-dashed border-black/30 dark:border-white/30 flex items-center justify-center relative">
            {/* عقرب البوصلة الأسود */}
            <div className="absolute w-8 h-20 -top-1 left-16 transform -rotate-12">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[40px] border-b-black dark:border-b-white"></div>
            </div>

            {/* نقطة المركز البنفسجية */}
            <div className="w-3.5 h-3.5 rounded-full bg-purple-600 shadow-md"></div>
          </div>
        </div>
      </Hotspot>

      {/* 3. بطاقة اتجاه القبلة: 244° */}
      <Hotspot 
        className="w-full"
        onClick={() => onInspect({
          title: 'بطاقة زاوية القبلة: 244°',
          purpose: 'توضح الزاوية الرياضية لانحراف القبلة بدرجات البوصلة من موقعك مشخصاً نحو الكعبة المشرفة بمكة المكرمة.'
        })}
      >
        <div 
          className="p-4 rounded-2xl border-2 text-center shadow-xs flex flex-col gap-1"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <h3 className="text-lg sm:text-xl font-black font-kufi">
            اتجاه القبلة: 244°
          </h3>
          <p className="text-xs opacity-75 font-bold">
            قم بمحاذاة السهم الأسود مع علامة الشمال (ش)
          </p>
        </div>
      </Hotspot>

      <p className="text-center text-[11px] font-bold opacity-60 mt-1">
        (يجب تفعيل الموقع للهاتف لحساب الموقع بدقه)
      </p>

    </div>
  );
};

// =============================================================
// 10. صفحة الاستماع للقرآن (ListenQuran) - مطابقة 100% للصورة المرفقة
// =============================================================
export const ListenQuranMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. قائمة اختيار القارئ */}
      <Hotspot onClick={() => onInspect({
        title: 'قائمة اختيار القارئ الصوتي',
        purpose: 'تتيح لك الاختيار والبحث من بين عشرات من كبار القراء المشاهير في العالم الإسلامي بروايات حفص، ورش، قالون، والمصحف المرتل والمجود والمعلم.'
      })}>
        <div 
          className="p-3.5 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs font-black text-sm"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <ChevronDown size={20} className="opacity-70" />
          <span>إبراهيم الأخضر</span>
        </div>
      </Hotspot>

      {/* 2. قائمة اختيار السورة */}
      <Hotspot onClick={() => onInspect({
        title: 'قائمة اختيار السورة القرآنية',
        purpose: 'تفتح فهرس سور القرآن الكريم الـ 114 لاختيار أي سورة للاستماع إليها مباشرة مع بيان رقمها وعدد آياتها.'
      })}>
        <div 
          className="p-3.5 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs font-black text-sm"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <ChevronDown size={20} className="opacity-70" />
          <span>1 - الفاتحة</span>
        </div>
      </Hotspot>

      {/* 3. مشغل الصوت الرئيسي */}
      <div 
        className="p-4 sm:p-5 rounded-2xl border-2 shadow-xs flex flex-col gap-4"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        {/* شريط التقدم */}
        <Hotspot onClick={() => onInspect({ title: 'شريط التمرير الزمني', purpose: 'يمكنك سحب هذا المؤشر للتقديم أو التأخير في التلاوة بدقة الثواني مع عرض الوقت المتبقي والمنقضي.' })}>
          <div className="space-y-1">
            <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-black dark:bg-white shadow-sm"></div>
            </div>
            <div className="flex justify-between text-[11px] font-mono opacity-60 pt-0.5">
              <span>٠١:٠١</span>
              <span>..:..</span>
            </div>
          </div>
        </Hotspot>

        {/* أزرار المشغل الرئيسية */}
        <div className="flex items-center justify-around py-1">
          <Hotspot onClick={() => onInspect({ title: 'زر السورة التالية', purpose: 'ينتقل مباشرة لتشغيل السورة القرآنية التالية في ترتيب المصحف الشريف.' })}>
            <span className="font-black text-sm sm:text-base">التالي</span>
          </Hotspot>

          <Hotspot onClick={() => onInspect({ title: 'زر التشغيل والإيقاف', purpose: 'يبدأ تشغيل التلاوة الصوتية للسورة أو يوقفها مؤقتاً مع حفظ آخر موضع وقفت عنده بدقة.' })}>
            <div className="w-16 h-16 rounded-full bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-lg">
              <Play size={28} className="fill-current ml-1" />
            </div>
          </Hotspot>

          <Hotspot onClick={() => onInspect({ title: 'زر السورة السابقة', purpose: 'ينتقل مباشرة لتشغيل السورة السابقة في المصحف.' })}>
            <span className="font-black text-sm sm:text-base">السابق</span>
          </Hotspot>
        </div>

        {/* خيارات التكرار والتشغيل المتواصل */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-black/5 dark:border-white/5">
          <Hotspot onClick={() => onInspect({ title: 'زر تكرار السورة', purpose: 'يقوم بإعادة تشغيل السورة الحالية تلقائياً فور انتهائها لترسيخ الحفظ والمدارسة.' })}>
            <div className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs">
              <RotateCcw size={16} className="text-emerald-600" />
              <span>تكرار السورة ✓</span>
            </div>
          </Hotspot>

          <Hotspot onClick={() => onInspect({ title: 'زر التشغيل المتواصل', purpose: 'ينتقل تلقائياً لتشغيل السور التالية تباعاً دون توقف لتستمع إلى المصحف كاملاً.' })}>
            <div className="p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold opacity-75 shadow-xs">
              <SkipForward size={16} />
              <span>تشغيل متواصل</span>
            </div>
          </Hotspot>
        </div>
      </div>

      {/* 4. بطاقة مؤقت النوم */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        <Hotspot onClick={() => onInspect({
          title: 'بطاقة مؤقت النوم الذكي',
          purpose: 'ميزة مريحة لإيقاف صوت التلاوة تلقائياً عند النوم؛ تتيح لك الاستماع للتلاوة بخشوع في الفراش مع ضبط وقت محدد لإغلاق الصوت أو إيقافه فور انتهاء السورة تلقائياً لتوفير شحن بطارية هاتفك.'
        })}>
          <div className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold opacity-60">متوقف</span>
            <div className="flex items-center gap-1.5 font-black text-sm font-kufi">
              <span>مؤقت النوم</span>
              <span>🌙</span>
            </div>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'خيارات مؤقت النوم (15 • 30 • 60 دقيقة • آخر السورة)',
          purpose: 'أزرار سريعة جاهزة لتحديد وقت إيقاف التلاوة بلمسة واحدة: إما بعد 15 دقيقة، أو 30 دقيقة، أو 60 دقيقة، أو إيقاف التلاوة تلقائياً عند اكتمال وانتهاء السورة الحالية.'
        })}>
          <div className="grid grid-cols-4 gap-1.5 text-center text-xs font-bold cursor-pointer">
            <span className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">15 دقيقة</span>
            <span className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">30 دقيقة</span>
            <span className="p-2 rounded-xl border hover:bg-black/5 dark:hover:bg-white/5 transition-colors">60 دقيقة</span>
            <span className="p-2 rounded-xl border truncate hover:bg-black/5 dark:hover:bg-white/5 transition-colors">آخر السورة</span>
          </div>
        </Hotspot>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Hotspot onClick={() => onInspect({
            title: 'أزرار ضبط وتعديل الدقائق (+ و -)',
            purpose: 'تتيح لك زيادة أو تقليل دقائق مؤقت النوم بدقة بالسحب أو النقر لتحديد أي مدة مخصصة تناسب وقت نومك واسترخائك.'
          })}>
            <div className="flex items-center gap-2 cursor-pointer">
              <span className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold hover:bg-black/5">-</span>
              <span className="text-xs font-bold px-3 py-1.5 rounded-lg border">15 دقيقة</span>
              <span className="w-8 h-8 rounded-lg border flex items-center justify-center font-bold hover:bg-black/5">+</span>
            </div>
          </Hotspot>

          <Hotspot onClick={() => onInspect({
            title: 'زر بدء / إيقاف مؤقت النوم',
            purpose: 'يقوم بتفعيل العد التنازلي لإيقاف صوت التلاوة تلقائياً عند انتهاء الوقت، والنقر عليه مرة أخرى أثناء عمل المؤقت يقوم بإلغائه وإعادة ضبطه.'
          })}>
            <div className="py-2 px-4 rounded-xl bg-black text-white dark:bg-white dark:text-black font-bold text-xs cursor-pointer text-center hover:opacity-90 transition-opacity">
              بدء المؤقت
            </div>
          </Hotspot>
        </div>
      </div>

      {/* 5. بطاقة خيارات التشغيل وتحميل المصحف */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-3 text-xs sm:text-sm font-bold"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        <Hotspot onClick={() => onInspect({
          title: 'مفتاح تكرار نفس السورة تلقائياً',
          purpose: 'مفتاح تبديل لتكرار السورة الحالية تلقائياً وبشكل مستمر بمجرد انتهائها، وهو خيار مثالي لحفظ ومراجعة السورة وتكرار الاستماع إليها.'
        })}>
          <div className="flex items-center justify-between cursor-pointer">
            <div className="w-10 h-5 bg-black dark:bg-white rounded-full relative p-0.5"><div className="w-4 h-4 bg-white dark:bg-black rounded-full"></div></div>
            <span>تكرار نفس السورة بعد انتهائها</span>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'مفتاح التشغيل المتواصل (السورة التالية)',
          purpose: 'مفتاح تبديل لتشغيل السور التالية تباعاً في ترتيب المصحف الشريف فور انتهاء السورة الحالية دون توقف، للاستماع إلى أجزاء القرآن كاملة دون لمس الهاتف.'
        })}>
          <div className="flex items-center justify-between opacity-75 cursor-pointer">
            <div className="w-10 h-5 bg-black/20 dark:bg-white/20 rounded-full relative p-0.5"><div className="w-4 h-4 bg-white rounded-full ml-auto"></div></div>
            <span>تشغيل متواصل (الانتقال للسورة التالية)</span>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر تحميل المصحف والتلاوات',
          purpose: 'ينقلك مباشرة إلى صفحة تحميل سور القرآن الكريم بصوت قارئك المفضل وتخزينها على جهازك لتستمع إليها أينما كنت بدون اتصال بالإنترنت.'
        })}>
          <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 cursor-pointer hover:opacity-85">
            <ChevronLeft size={16} className="opacity-60" />
            <div className="flex items-center gap-1.5">
              <span>تحميل المصحف</span>
              <Download size={16} />
            </div>
          </div>
        </Hotspot>
      </div>

      {/* 6. بطاقة المفضلات المحفوظة */}
      <div 
        className="p-4 rounded-2xl border-2 shadow-xs flex flex-col gap-2.5"
        style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
      >
        <Hotspot onClick={() => onInspect({
          title: 'بطاقة المفضلات المحفوظة',
          purpose: 'قائمة سريعة تتسع لحفظ حتى 10 سور مع كبار القراء المفضلين لكل سورة، لتشغيل تلاواتك المفضلة بلمسة واحدة دون الحاجة للبحث المتكرر في القوائم.'
        })}>
          <div className="flex items-center justify-between cursor-pointer">
            <span className="text-xs font-bold opacity-60">1 / 10</span>
            <div className="flex items-center gap-1 font-black text-sm font-kufi">
              <span>المفضلات المحفوظة</span>
              <span className="text-red-500">❤️</span>
            </div>
          </div>
        </Hotspot>

        <div className="p-3 rounded-xl border flex items-center justify-between text-xs font-bold">
          <Hotspot onClick={() => onInspect({
            title: 'زر حذف السورة من المفضلة',
            purpose: 'يحذف هذه السورة والقارئ من قائمة المفضلات لإفساح المجال لإضافة سور وقراء آخرين.'
          })}>
            <div className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer">
              <Trash2 size={16} className="opacity-70 text-red-500 hover:opacity-100" />
            </div>
          </Hotspot>

          <Hotspot 
            className="flex-1 flex items-center justify-between px-2 cursor-pointer"
            onClick={() => onInspect({
              title: 'تشغيل السورة المفضلة مباشرة',
              purpose: 'بالنقر على أي سورة في قائمة المفضلات، يتم تحديد السورة والقارئ فوراً وبدء التلاوة الصوتية مباشرة.'
            })}
          >
            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 text-[10px]">المحددة</span>
            <div className="text-right">
              <h5 className="font-black text-sm">سورة الفاتحة</h5>
              <span className="text-[11px] opacity-70">القارئ: إبراهيم الأخضر</span>
            </div>
          </Hotspot>

          <span className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px]">1</span>
        </div>
      </div>

      <p className="text-center text-[11px] font-bold opacity-60">
        ملاحظة: لا تعمل هذه الصفحة إلا إذا كنت متصلاً بالإنترنت، ويفضل الواي فاي.
      </p>

    </div>
  );
};

// =============================================================
// 11. صفحة أهل القرآن الكريم (AhlAlQuran) - مطابقة 100% للصورة المرفقة
// =============================================================
export const AhlAlQuranMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. التبويبات الثلاثة العلوية */}
      <Hotspot onClick={() => onInspect({
        title: 'تبويبات أهل القرآن الكريم',
        purpose: 'تتيح لك التنقل بين: لوحة المتصدرين وقراء الشهر، إحصائياتك الشخصية لعدد الصفحات والسور المقروءة، وإعدادات الخصوصية والظهور (الاسم والبلد).'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="py-2 px-3 rounded-xl bg-emerald-600 text-white flex items-center justify-center gap-1.5 font-black flex-1 shadow-xs">
            <Trophy size={16} />
            <span>لوحة المتصدرين</span>
          </div>
          <div className="py-2 px-3 flex items-center justify-center gap-1.5 opacity-70 flex-1">
            <UserCheck size={16} />
            <span>إحصائياتي</span>
          </div>
          <div className="py-2 px-3 flex items-center justify-center gap-1.5 opacity-70 flex-1">
            <Shield size={16} />
            <span>الخصوصية والظهور</span>
          </div>
        </div>
      </Hotspot>

      {/* 2. شريط فلترة الشهر والأرشيف - من اليمين إلى اليسار */}
      <Hotspot onClick={() => onInspect({
        title: 'شريط اختيار الشهر والأرشيف',
        purpose: 'يتيح لك استعراض المتصدرين للشهر الهجري الحالي، أو فتح الأرشيف للاطلاع على سجل المتصدرين في الأشهر والسنوات السابقة.'
      })}>
        <div 
          className="p-2.5 px-3.5 rounded-2xl border-2 flex items-center justify-between text-xs sm:text-sm font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-1.5">
            <Calendar size={16} className="text-emerald-600" />
            <span>جمادى الأولى 8...</span>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 text-xs font-black">الشهر الحالي</span>
          <div className="flex items-center gap-1.5 opacity-75">
            <span>الأرشيف</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </Hotspot>

      {/* 3. بطاقة ترتيبك الشخصي: المركز 3 - من اليمين إلى اليسار */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة ترتيبك الشهري بين قراء القرآن',
        purpose: 'توضح مركزك الحالي وترتيبك التنافسي في قراءة القرآن الكريم لهذا الشهر مع بيان عدد الصفحات التي قرأتها وسجلتها.'
      })}>
        <div 
          className="p-3.5 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm shrink-0">
              #3
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm">ترتيبك في جمادى الأولى 1448هـ:</span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 text-xs font-black">المركز 3</span>
              </div>
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block mt-1">صفحة واحدة</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 4. لوحة المتصدرين الثلاثة - من اليمين إلى اليسار */}
      {/* المركز الأول: فاعل خير */}
      <Hotspot onClick={() => onInspect({
        title: 'المتصدر بالمركز الأول (الميدالية الذهبية)',
        purpose: 'صاحب المركز الأول لهذا الشهر بإجمالي 13 صفحة مسجلة وموثقة داخل التطبيق.'
      })}>
        <div 
          className="p-3 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          {/* اليمين: الترتيب واسم القارئ */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              1
            </div>
            <div className="text-right flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-start">
                <h5 className="font-black text-xs sm:text-sm text-amber-600">فاعل خير (قارئ للقرآن)</h5>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-black/5 dark:bg-white/5 opacity-70">مجهول</span>
              </div>
              <span className="text-[10px] opacity-60 block mt-0.5">▪ 13 صفحة مسجلة</span>
            </div>
          </div>

          {/* اليسار: عدد الصفحات المسجلة */}
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">13 صفحة</span>
        </div>
      </Hotspot>

      {/* المركز الثاني: المتسابق الثاني (اسم افتراضي) */}
      <Hotspot onClick={() => onInspect({
        title: 'المتصدر بالمركز الثاني (الميدالية الفضية)',
        purpose: 'صاحب المركز الثاني لهذا الشهر بإجمالي 6 صفحات مسجلة وموثقة داخل التطبيق.'
      })}>
        <div 
          className="p-3 px-4 rounded-2xl border-2 flex items-center justify-between shadow-xs ml-4"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          {/* اليمين: الترتيب واسم القارئ */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-slate-400 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              2
            </div>
            <div className="text-right flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-start">
                <h5 className="font-black text-xs sm:text-sm">المتسابق الثاني (محب القرآن)</h5>
                <span className="text-xs opacity-75">🌐 عضو مميز</span>
              </div>
              <span className="text-[10px] opacity-60 block mt-0.5">▪ 6 صفحات مسجلة</span>
            </div>
          </div>

          {/* اليسار: عدد الصفحات المسجلة */}
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">6 صفحات</span>
        </div>
      </Hotspot>

      {/* المركز الثالث: المتسابق الثالث (اسم افتراضي) */}
      <Hotspot onClick={() => onInspect({
        title: 'المتصدر بالمركز الثالث (الميدالية البرونزية)',
        purpose: 'صاحب المركز الثالث برصيد صفحة واحدة مسجلة، ويرتفع الترتيب تلقائياً بتسجيل القراءة اليومية للقرآن الكريم.'
      })}>
        <div 
          className="p-3 px-4 rounded-2xl border-2 border-emerald-500 flex items-center justify-between shadow-xs ml-8"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', color: textColor }}
        >
          {/* اليمين: الترتيب واسم القارئ */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
              3
            </div>
            <div className="text-right flex-1 min-w-0">
              <div className="flex items-center gap-1.5 justify-start">
                <h5 className="font-black text-xs sm:text-sm text-amber-700 dark:text-amber-400">المتسابق الثالث (عضو مجتهد)</h5>
                <span className="text-xs opacity-75">🇪🇬 مصر</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white">متسابق</span>
              </div>
              <span className="text-[10px] opacity-60 block mt-0.5">▪ 1 صفحة مسجلة</span>
            </div>
          </div>

          {/* اليسار: عدد الصفحات المسجلة */}
          <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">صفحة واحدة</span>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// =============================================================
// 12. صفحة القرآن الكريم (MushafPage & QuranReader) - مطابقة تماماً للمصحف الأصلي
// =============================================================

// مكوّن فاصل ورقم الآية القرآني المطابق لمصحف التطبيق الأصلي
const ExactAyahMarker: React.FC<{ num: string }> = ({ num }) => (
  <span className="verse-container inline-flex items-center mx-1 cursor-pointer select-none font-amiri align-middle">
    <span className="verse-bracket text-[#059669] dark:text-[#34d399] font-bold text-[0.88em]">﴿</span>
    <span className="verse-num-inner text-[#b91c1c] dark:text-[#f87171] font-black text-[0.88em] px-0.5">{num}</span>
    <span className="verse-bracket text-[#059669] dark:text-[#34d399] font-bold text-[0.88em]">﴾</span>
  </span>
);

export const QuranReaderMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme
}) => {
  const bgColor = isBlackTheme ? '#121212' : '#ffffff';
  const pageTextColor = isBlackTheme ? '#ffffff' : '#000000';
  const frameBorderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000';
  const surahHeaderBg = isBlackTheme ? '#1e1e1e' : '#ffffff';

  return (
    <div 
      className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col rounded-2xl overflow-hidden shadow-2xl select-none font-amiri border-2 transition-colors" 
      style={{ backgroundColor: bgColor, color: pageTextColor, borderColor: frameBorderColor }}
      dir="rtl"
    >
      
      {/* 1. الشريط العلوي (مطابق تماماً للشريط العلوي للمصحف) */}
      <div 
        className="w-full h-14 border-b-2 flex items-center justify-between px-3 shrink-0"
        style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
      >
        {/* زر القائمة الجانبية (يمين) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر القائمة الجانبية',
          purpose: 'يفتح القائمة الجانبية للمصحف الشريف لاختيار أنماط القراءة (المصحف، التفسير، معاني المفردات، الترجمة)، وتخصيص المظهر والثيمات، واختيار القراء، والخطوط، والتحميلات، والبحث في القرآن، وإعدادات المصحف.'
        })}>
          <div 
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <Menu size={20} color={pageTextColor} strokeWidth={2.4} />
          </div>
        </Hotspot>

        {/* زر اسم السورة ورقم الآية والجزء (المنتصف) */}
        <Hotspot className="flex-1 min-w-0 mx-2" onClick={() => onInspect({
          title: 'زر اسم السورة ورقم الآية والجزء',
          purpose: 'يعرض اسم السورة الحالية ورقم الآية ورقم الجزء، وعند النقر عليه يفتح فهرس القرآن الكريم الشامل (السور، الأجزاء، والأحزاب) للبحث والانتقال السريع لأي موضع في المصحف.'
        })}>
          <div 
            className="h-10 rounded-xl border-2 flex items-center justify-center px-2 transition-colors cursor-pointer hover:opacity-85"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <span className="text-xs sm:text-sm font-bold truncate tracking-wide font-sans" style={{ color: pageTextColor }}>
              ١ - سورة الفاتحة - ايه ١ - جزء ١
            </span>
          </div>
        </Hotspot>

        {/* زر ورقم الصفحة (يسار المنتصف) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر ورقم الصفحة',
          purpose: 'يعرض رقم الصفحة الحالية، وعند النقر عليه يتحول إلى خانة إدخال رقمية تتيح لك كتابة أي رقم صفحة من 1 إلى 604 والانتقال إليها فوراً.'
        })}>
          <div 
            className="w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-base transition-colors cursor-pointer hover:opacity-85"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor, color: pageTextColor }}
          >
            ١
          </div>
        </Hotspot>

        {/* زر تشغيل التلاوة الصوتية (يسار) */}
        <Hotspot className="mr-1" onClick={() => onInspect({
          title: 'زر التلاوة الصوتية',
          singleClickAction: 'تشغيل أو إيقاف التلاوة الصوتية للآيات بصوت القارئ المختار مع تظليل الآية المقروءة.',
          longPressAction: 'الضغط المطول يفتح مباشرة نافذة اختيار القارئ من بين نخبة كبار قراء العالم الإسلامي دون الحاجة لدخول الإعدادات.'
        })}>
          <div 
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <div 
              className="w-7 h-7 rounded-full flex items-center justify-center pl-0.5"
              style={{ backgroundColor: isBlackTheme ? '#ffffff' : '#000000' }}
            >
              <Play size={14} fill={isBlackTheme ? '#000000' : '#ffffff'} color={isBlackTheme ? '#000000' : '#ffffff'} />
            </div>
          </div>
        </Hotspot>

      </div>

      {/* 2. جسم صفحة المصحف الشريف بإطارها المزدوج وتصميمها الأصلي 100% */}
      <div className="p-2 sm:p-3">
        <div 
          className="rounded-xl border-[3.5px] border-double p-3 sm:p-4 flex flex-col items-center shadow-inner"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.5)' : '#000000' }}
        >
          {/* ترويسة سورة الفاتحة (Surah Header Design 1) */}
          <Hotspot 
            className="w-full mb-3"
            onClick={() => onInspect({
              title: 'ترويسة السورة',
              longPressAction: 'الضغط المطول على ترويسة السورة يفتح منتقي تصاميم وبراويز السور لاختيار الشكل الزخرفي والمحرابي المفضل لترويسة السور من بين تصاميم عثمانية وإسلامية متنوعة.'
            })}
          >
            <div 
              className="relative h-13 sm:h-14 w-full flex items-center justify-between px-3 sm:px-5 rounded-md border-[2.5px] overflow-hidden shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
              style={{ 
                backgroundColor: surahHeaderBg,
                borderColor: frameBorderColor
              }}
            >
              {/* يمين: عدد الآيات */}
              <span className="font-bold text-xs sm:text-sm font-amiri z-10" style={{ color: pageTextColor }}>
                ٧ آيات
              </span>

              {/* منتصف: كبسولة اسم السورة البيضاوية */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                  className="relative h-9 px-6 sm:px-10 flex items-center justify-center border-2 shadow-xs"
                  style={{ 
                    borderRadius: '50px',
                    backgroundColor: surahHeaderBg,
                    borderColor: frameBorderColor
                  }}
                >
                  <h2 className="text-sm sm:text-base font-black whitespace-nowrap font-amiri" style={{ color: pageTextColor, transform: 'translateY(-2px)' }}>
                    سُورَةُ ٱلْفَاتِحَةِ
                  </h2>
                </div>
              </div>

              {/* يسار: نوع السورة */}
              <span className="font-bold text-xs sm:text-sm font-amiri z-10" style={{ color: pageTextColor }}>
                مَكِّيَّةٌ
              </span>
            </div>
          </Hotspot>

          {/* نص سورة الفاتحة الكامل بالرسم العثماني المطابق للمصحف الأصلي */}
          <div 
            className="w-full text-center font-amiri text-lg sm:text-[21px] leading-[2.5] sm:leading-[2.7] py-2 px-1 tracking-normal"
            style={{ color: pageTextColor }}
          >
            {/* الآية 1: البسملة */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity font-bold text-[#059669] dark:text-[#34d399]">
                بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (١)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="١" />
            </Hotspot>{' '}

            {/* الآية 2: الحمد لله رب العالمين */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٢)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٢" />
            </Hotspot>{' '}

            {/* الآية 3: الرحمن الرحيم */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٣)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٣" />
            </Hotspot>{' '}

            {/* الآية 4: مالك يوم الدين */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                مَـٰلِكِ يَوْمِ ٱلدِّينِ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٤)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٤" />
            </Hotspot>{' '}

            {/* الآية 5: إياك نعبد وإياك نستعين */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٥)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٥" />
            </Hotspot>{' '}

            {/* الآية 6: اهدنا الصراط المستقيم */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٦)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٦" />
            </Hotspot>{' '}

            {/* الآية 7: صراط الذين أنعمت عليهم غير المغضوب عليهم ولا الضالين */}
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'نص الآية الكريمة',
                singleClickAction: 'تظليل الآية الكريمة ومتابعة القراءة، وإظهار أو إخفاء أشرطة الأدوات العلوية والسفلية، وإيقاف أو استئناف التمرير التلقائي.',
                longPressAction: 'الضغط المطول يفتح قائمة سياق الآية لمشاركتها كبطاقة دعوية راقية أو نسخ النص العثماني وقراءة التفسير الميسر.'
              })}
            >
              <span className="cursor-pointer hover:opacity-75 transition-opacity">
                صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ
              </span>
            </Hotspot>
            <Hotspot 
              className="inline"
              onClick={() => onInspect({
                title: 'فاصل ورقم الآية (٧)',
                singleClickAction: 'النقر يفتح تفسير الآية الكريمة الميسر لشرح معاني الكلمات وأسباب النزول وبيان المعنى الإجمالي.',
                longPressAction: 'الضغط المطول يفتح نافذة اختيار كتب التفاسير المعتمدة للتبديل بين كتب التفسير (ابن كثير، السعدي، الجلالين، القرطبي، الطبري، البغوي، والميسر).'
              })}
            >
              <ExactAyahMarker num="٧" />
            </Hotspot>
          </div>

          {/* تذييل الصفحة ورقمها مطابق لمصحف التطبيق الأصلي */}
          <Hotspot
            onClick={() => onInspect({
              title: 'رقم الصفحة وتذييل المصحف الشريف',
              purpose: 'يعرض رقم الصفحة الحالية (١) ضمن إطار مقوس مذهب، مع الخط الفاصل الجمالي المطابق لمصاحف المدينة المنورة وتصميم التطبيق الأصيل.'
            })}
          >
            <div className="flex flex-col items-center justify-center pt-2 pb-1 cursor-pointer">
              <div className="flex items-center justify-center font-amiri text-lg">
                <span className="text-[#d97706] font-normal mx-0.5">﴿</span>
                <span className="text-[#1d4ed8] dark:text-[#60a5fa] font-bold mx-0.5">١</span>
                <span className="text-[#d97706] font-normal mx-0.5">﴾</span>
              </div>
              <div className="w-24 h-[2px] bg-[#d97706] opacity-80 rounded mt-1"></div>
            </div>
          </Hotspot>
        </div>
      </div>

      {/* 3. الشريط السفلي (مطابق تماماً للشريط السفلي للمصحف الأصلي) */}
      <div 
        className="w-full h-16 border-t-2 flex items-center justify-around px-4 shrink-0"
        style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
      >
        {/* زر المشاركة (أقصى اليمين في المصحف الأصلي) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر مشاركة الآية كبطاقة دعوية',
          purpose: 'يفتح محرر تصميم الآيات المذهب الفخم لتحويل الآية القرآنية إلى بطاقة دعوية أنيقة مع اختيار الخلفية والإطار والخط لمشاركتها عبر الواتساب ووسائل التواصل.'
        })}>
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <Share2 size={22} color={pageTextColor} strokeWidth={2.2} />
          </div>
        </Hotspot>

        {/* زر العلامة المرجعية */}
        <Hotspot onClick={() => onInspect({
          title: 'زر العلامة المرجعية',
          singleClickAction: 'يحفظ علامة مرجعية فورية وسريعة على الآية والصفحة الحالية بضغطة واحدة، ليثبت موضع وقوفك في الختمة.',
          longPressAction: 'يفتح سجل وقائمة جميع الإشارات المرجعية والفواصل المحفوظة مسبقاً، مع تاريخ ووقت كل علامة، للانتقال المباشر لأي علامة أو حذفها.'
        })}>
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <Bookmark size={22} color={pageTextColor} strokeWidth={2.2} />
          </div>
        </Hotspot>

        {/* زر التمرير التلقائي (السهم لأسفل) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر التمرير التلقائي الذكي',
          singleClickAction: 'يقوم بتحريك وتقليب أسطر وصفحات المصحف تلقائياً بشكل انسيابي هادئ لتتمكن من القراءة بدون لمس الشاشة نهائياً.',
          longPressAction: 'يفتح نافذة إعدادات وسرعة التمرير التلقائي لزيادة أو تقليل سرعة نزول وانسياب الصفحات لتناسب سرعة قراءتك تماماً.'
        })}>
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <ChevronDown size={26} color={pageTextColor} strokeWidth={2.4} />
          </div>
        </Hotspot>

        {/* زر الرئيسية - المنزل (أقصى اليسار في المصحف الأصلي) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر الصفحة الرئيسية',
          purpose: 'يعيدك مباشرة إلى الشاشة الرئيسية للتطبيق مع حفظ موضع قراءتك الحالي تلقائياً لاستئناف القراءة في أي وقت.'
        })}>
          <div 
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center transition-colors cursor-pointer hover:opacity-80"
            style={{ borderColor: frameBorderColor, backgroundColor: bgColor }}
          >
            <Home size={22} color={pageTextColor} strokeWidth={2.2} />
          </div>
        </Hotspot>

      </div>

    </div>
  );
};

// =============================================================
// 13. صفحة الحج والعمرة (HajjUmrah) - مطابقة 100% للصفحة المحدثة
// =============================================================
export const HajjUmrahMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. الصف الأول: دليل العمرة + دليل الحج (بدون أيقونات) */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* دليل الحج */}
        <Hotspot onClick={() => onInspect({
          title: 'زر دليل الحج',
          purpose: 'شرح مفصل لمناسك الحج بأنواعه الثلاثة (التمتع، الإفراد، القِران) مع المخطط الزمني لمحطات النسك يوماً بيوم من يوم التروية وحتى طواف الوداع وأدلة الكتاب والسنة.'
        })}>
          <div 
            className="rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-20 sm:h-24 shadow-xs transition-all w-full"
            style={{ 
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
              color: textColor 
            }}
          >
            <span className="font-bold text-base sm:text-lg font-kufi">دليل الحج</span>
          </div>
        </Hotspot>

        {/* دليل العمرة */}
        <Hotspot onClick={() => onInspect({
          title: 'زر دليل العمرة',
          purpose: 'دليل شامل لمناسك العمرة خطوة بخطوة موثقة بالقرآن الكريم وصحيح السنة النبوية، مع بيان الأركان والواجبات والسنن والمحظورات وتفاصيل الطواف والسعي.'
        })}>
          <div 
            className="rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-20 sm:h-24 shadow-xs transition-all w-full"
            style={{ 
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
              color: textColor 
            }}
          >
            <span className="font-bold text-base sm:text-lg font-kufi">دليل العمرة</span>
          </div>
        </Hotspot>
      </div>

      {/* 2. الصف الثاني: أدعية وأذكار + عَدّاد الطواف (بدون أيقونات) */}
      <div className="grid grid-cols-2 gap-3 w-full">
        {/* أدعية وأذكار */}
        <Hotspot onClick={() => onInspect({
          title: 'زر أدعية وأذكار',
          purpose: 'موسوعة أدعية وأذكار الحج والعمرة المأثورة عن النبي ﷺ في الطواف والمسعى ويوم عرفة والمشعر الحرام مع إمكانية التكبير والتنقل السهل بين الأدعية.'
        })}>
          <div 
            className="rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-20 sm:h-24 shadow-xs transition-all w-full"
            style={{ 
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
              color: textColor 
            }}
          >
            <span className="font-bold text-base sm:text-lg font-kufi">أدعية وأذكار</span>
          </div>
        </Hotspot>

        {/* عَدّاد الطواف */}
        <Hotspot onClick={() => onInspect({
          title: 'زر عَدّاد الطواف',
          purpose: 'عداد إلكتروني تفاعلي لمتابعة أشواط الطواف والسعي (٧ أشواط) مع التكبير والدعاء المأثور لكل شوط وخاصية الاهتزاز عند اكتمال كل شوط.'
        })}>
          <div 
            className="rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-20 sm:h-24 shadow-xs transition-all w-full"
            style={{ 
              backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
              color: textColor 
            }}
          >
            <span className="font-bold text-base sm:text-lg font-kufi">عَدّاد الطواف</span>
          </div>
        </Hotspot>
      </div>

      {/* 3. الصف الثالث: قائمة التجهيزات والأمتعة (بعرض كامل) */}
      <Hotspot onClick={() => onInspect({
        title: 'زر قائمة التجهيزات والأمتعة',
        purpose: 'قائمة تفاعلية ذكية لتنظيم وتجهيز مستلزمات الحج والعمرة، ملابس الإحرام، الأدوية، والأوراق الهامة لضمان عدم نسيان أي متطلب قبل السفر.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col items-center justify-center gap-2 h-16 sm:h-20 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <span className="font-bold text-base sm:text-lg font-kufi">قائمة التجهيزات والأمتعة</span>
        </div>
      </Hotspot>

      {/* 4. بطاقة: فضل الحج والعمرة (مع أيقونة العدسة لتكبير النص) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة فضل الحج والعمرة',
        purpose: 'تذكير إيماني بفضل وثواب الحج المبرور والعمرة وتكفير الذنوب مستنداً إلى الحديث النبوي الشريف الصحيح عن أبي هريرة رضي الله عنه مع أيقونة العدسة للتكبير.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col gap-2.5 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-teal-600 dark:text-teal-400 font-kufi">فضل الحج والعمرة</span>
            <ZoomIn className="w-5 h-5 opacity-70 hover:opacity-100" />
          </div>
          <div className="border-r-2 border-teal-600 dark:border-teal-400 pr-3">
            <p className="text-xs sm:text-sm leading-relaxed font-medium text-right opacity-90">
              عن أبي هريرة رضي الله عنه أن رسول الله ﷺ قال: "العُمْرَةُ إِلَى العُمْرَةِ كَفَّارَةٌ لِمَا بَيْنَهُمَا، وَالحَجُّ المَبْرُورُ لَيْسَ لَهُ جَزَاءٌ إِلَّا الجَنَّةُ".
            </p>
          </div>
        </div>
      </Hotspot>

      {/* 5. بطاقة: محظورات الإحرام (مع أيقونة العدسة لتكبير النص) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة محظورات الإحرام',
        purpose: 'بيان ما يحرم على المحرم فعله بعد عقد نية النسك كالطيب والمخيط وتغطية الرأس وعقد النكاح والصيد مع أيقونة العدسة لتكبير وقراءة المحظورات.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-purple-600 dark:text-purple-400 font-kufi">محظورات الإحرام</span>
            <ZoomIn className="w-5 h-5 opacity-70 hover:opacity-100" />
          </div>
          <div className="space-y-2 text-right">
            {[
              'إزالة الشعر أو قص الأظافر.',
              'استعمال الطيب بعد الإحرام.',
              'لبس المخيط للرجل وتغطية الرأس.',
              'لبس النقاب والقفازين للمرأة.',
              'عقد النكاح أو الخطبة.',
              'الجماع ومقدماته.',
              'صيد البر.'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-end gap-2.5 text-xs sm:text-sm font-medium">
                <span className="opacity-90">{item}</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-500 shrink-0"></span>
              </div>
            ))}
          </div>
        </div>
      </Hotspot>

      {/* 6. بطاقة: المواقيت المكانية (مع أيقونة العدسة لتكبير النص) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة المواقيت المكانية',
        purpose: 'توضيح حدود ومواقيت الإحرام المكانية الخمسة المحددة شرعاً لكل قادم إلى مكة المكرمة لأداء المناسك مع أيقونة العدسة للتكبير.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-teal-600 dark:text-teal-400 font-kufi">المواقيت المكانية</span>
            <ZoomIn className="w-5 h-5 opacity-70 hover:opacity-100" />
          </div>
          <div className="space-y-2 text-right">
            {[
              'ذو الحليفة (لأهل المدينة).',
              'الجحفة (لأهل الشام ومصر والمغرب).',
              'قرن المنازل (لأهل نجد).',
              'يلملم (لأهل اليمن).',
              'ذات عرق (لأهل العراق).'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-end gap-2.5 text-xs sm:text-sm font-medium">
                <span className="opacity-90">{item}</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-500 shrink-0"></span>
              </div>
            ))}
          </div>
        </div>
      </Hotspot>

      {/* 7. بطاقة: ما الفرق بين الحج والعمرة؟ (مع أيقونة العدسة لتكبير النص) */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة الفرق بين الحج والعمرة',
        purpose: 'مقارنة فقهية سريعة توضح الفروق الجوهرية بين فريضة الحج والنافلة/الواجب في العمرة مع أيقونة العدسة للتكبير.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col gap-3 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-base sm:text-lg text-teal-600 dark:text-teal-400 font-kufi">ما الفرق بين الحج والعمرة؟</span>
            <ZoomIn className="w-5 h-5 opacity-70 hover:opacity-100" />
          </div>
          <div className="space-y-2 text-right">
            {[
              'الحج ركن من أركان الإسلام، أما العمرة فواجبة مرة في العمر على القول الراجح.',
              'الحج له وقت محدد (أشهر الحج)، بينما العمرة متاحة طوال العام.',
              'أعمال الحج أكبر وتشمل الوقوف بعرفة والمبيت بمنى ومزدلفة ورمي الجمار.'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start justify-end gap-2.5 text-xs sm:text-sm font-medium">
                <span className="opacity-90 leading-relaxed">{item}</span>
                <span className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-500 shrink-0 mt-1.5"></span>
              </div>
            ))}
          </div>
        </div>
      </Hotspot>

      {/* 8. بطاقة: تنبيه هام (مع أيقونة العدسة لتكبير النص) */}
      <Hotspot onClick={() => onInspect({
        title: 'تنبيه فقهي هام',
        purpose: 'قاعدة فقهية جوهرية توضح حكم ترك الركن والواجب والمحظور وما يترتب على كل منها من بطلان النسك أو لزوم الدم أو الفدية مع أيقونة العدسة لتكبير النص.'
      })}>
        <div 
          className="rounded-2xl border-2 p-4 flex flex-col gap-2 shadow-xs transition-all w-full"
          style={{ 
            backgroundColor: isBlackTheme ? '#141414' : '#ffffff', 
            borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', 
            color: textColor 
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="font-bold text-base sm:text-lg text-amber-600 dark:text-amber-500 font-kufi">تنبيه هام</span>
            <ZoomIn className="w-5 h-5 opacity-70 hover:opacity-100 text-amber-600 dark:text-amber-500" />
          </div>
          <p className="text-xs sm:text-sm leading-relaxed font-medium text-center opacity-90">
            ترك ركن يبطل النسك، أما ترك واجب فيُجبر بدم، وارتكاب المحظورات يوجب الفدية.
          </p>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 14. صفحة الورد اليومي (DailyWird)
// =============================================================
export const DailyWirdMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. بطاقة نسبة الإنجاز والتقدم */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة نسبة إنجاز الورد اليومي',
        purpose: 'تعرض تقدمك الإجمالي في ختمة القرآن الكريم بالنسبة المئوية وشريط الإنجاز، وعدد الأيام المكتملة وإجمالي أيام الخطة المتبقية.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs sm:text-sm">نسبة الإنجاز</span>
            <span className="font-black text-sm sm:text-base text-emerald-600 dark:text-emerald-400 font-mono">50.0%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '50%' }} />
          </div>
          <div className="flex items-center justify-between text-xs opacity-75 font-bold">
            <span>اليوم ١٥ من ٣٠</span>
            <span>١٥ يوماً مكتملاً</span>
          </div>
        </div>
      </Hotspot>

      {/* 2. بطاقة ورد اليوم مع نطاق الصفحات */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة ورد اليوم ونطاق الصفحات',
        purpose: 'تبين رقم اليوم الحالي في خطتك القرآنية، والصفحات المحددة لتلاوتها اليوم (من صفحة إلى صفحة) مع إمكانية فتح المصحف فورياً.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-3 shadow-xs text-center"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <h3 className="font-black text-base sm:text-lg text-emerald-600 dark:text-emerald-400 font-kufi">
            ورد اليوم (١٥)
          </h3>
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 p-3 rounded-2xl border bg-black/5 dark:bg-white/5 border-black/10 text-center">
              <span className="text-[10px] opacity-75 block font-bold">من صفحة</span>
              <span className="text-xl font-black font-mono">٢٨٢</span>
            </div>
            <span className="text-lg opacity-40 font-bold">-</span>
            <div className="flex-1 p-3 rounded-2xl border bg-black/5 dark:bg-white/5 border-black/10 text-center">
              <span className="text-[10px] opacity-75 block font-bold">إلى صفحة</span>
              <span className="text-xl font-black font-mono">٣٠٢</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 3. زر فتح المصحف للقراءة */}
      <Hotspot onClick={() => onInspect({
        title: 'زر فتح المصحف للقراءة',
        purpose: 'ينقلك مباشرة إلى صفحة بداية ورد اليوم في المصحف الشريف بالرسم العثماني مع تفعيل مؤشر متابعة الورد تلقائياً.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs"
          style={{ borderColor: isBlackTheme ? '#ffffff' : '#059669' }}
        >
          <BookOpen size={18} />
          <span>افتح المصحف للقراءة</span>
        </div>
      </Hotspot>

      {/* 4. زر تأكيد قراءة الورد اليومي */}
      <Hotspot onClick={() => onInspect({
        title: 'زر تأكيد قراءة الورد اليومي (تمت القراءة)',
        purpose: 'يقوم بتسجيل قراءة ورد اليوم بنجاح، وتحديث شريط الإنجاز، ونقلك تلقائياً إلى اليوم التالي في الخطة.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <CheckCircle size={18} className="text-emerald-500" />
          <span>تمت القراءة</span>
        </div>
      </Hotspot>

      {/* 5. شريط إدارة الختمة والإعدادات */}
      <div className="flex gap-2">
        <Hotspot 
          className="flex-1"
          onClick={() => onInspect({
            title: 'زر تعديل إعدادات الختمة',
            purpose: 'يتيح لك تعديل عدد أيام الختمة (مثلاً ٣٠ يوماً، أو شهرين) أو تحديد عدد الصفحات اليومية وتاريخ البداية.'
          })}
        >
          <div 
            className="p-3 rounded-2xl border-2 text-center text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <Settings size={15} />
            <span>تعديل الختمة</span>
          </div>
        </Hotspot>

        <Hotspot 
          className="flex-1"
          onClick={() => onInspect({
            title: 'زر إعادة ضبط الختمة',
            purpose: 'يتيح لك تصفير سجل الختمة والبدء من جديد أو إنشاء ختمة جديدة ومتابعتها من البداية.'
          })}
        >
          <div 
            className="p-3 rounded-2xl border-2 text-center text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 opacity-80"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <RotateCcw size={15} />
            <span>إعادة ضبط</span>
          </div>
        </Hotspot>
      </div>

    </div>
  );
};

// =============================================================
// 15. صفحة التحفيظ والمراجعة (Memorization)
// =============================================================
export const MemorizationMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. تبويبات إعداد الجلسة وسجل المراجعة */}
      <Hotspot onClick={() => onInspect({
        title: 'تبويبات التحفيظ والمراجعة',
        purpose: 'تتيح لك التبديل بين إعداد جلسة الترديد والتحفيظ الجديدة، واستعراض سجل المقاطع المحفوظة وجدول مراجعتها الدوري.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-center">
            إعداد جلسة التحفيظ
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            سجل الحفظ والمراجعة
          </div>
        </div>
      </Hotspot>

      {/* 2. بطاقة اختيار القارئ */}
      <Hotspot onClick={() => onInspect({
        title: 'خانة اختيار القارئ والمعلم',
        purpose: 'تتيح لك اختيار القارئ المفضل للترديد خلفه (مثل الشيخ عبد الباسط، المنشاوي، الحصري، العفاسي) بصوت مرتل نقي.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-2">
            <User size={18} className="text-emerald-500" />
            <span className="font-bold text-xs sm:text-sm">عبد الباسط عبد الصمد (مرتل)</span>
          </div>
          <ChevronDown size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 3. بطاقة تحديد نطاق الآيات */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة تحديد نطاق الآيات للحفظ',
        purpose: 'تحدد بدقة السورة والآية التي تبدأ منها والآية التي تنتهي عندها لترديدها وحفظها بشكل متصل ومحكم.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-2 text-xs font-black">
            <ArrowLeftRight size={16} />
            <span>نطاق الآيات المراد حفظها</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10">
              <span className="text-[10px] opacity-75 block font-bold">من</span>
              <span className="font-black">سورة الفاتحة : آية ١</span>
            </div>
            <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10">
              <span className="text-[10px] opacity-75 block font-bold">إلى</span>
              <span className="font-black">سورة الفاتحة : آية ٧</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 4. إعدادات التكرار والترديد */}
      <Hotspot onClick={() => onInspect({
        title: 'إعدادات التكرار والسكتة والربط',
        purpose: 'تضبط عدد مرات تكرار كل آية منفردة، وعدد مرات تكرار النطاق كاملاً، وتفعيل خاصية ربط الآيات والسكتة الزمنية للترديد.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-2 text-xs font-black">
            <Repeat size={16} />
            <span>إعدادات التكرار الذكي</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between px-3">
              <span className="opacity-80 font-bold">تكرار الآية:</span>
              <span className="font-black text-emerald-600">٥ مرات</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between px-3">
              <span className="opacity-80 font-bold">تكرار النطاق:</span>
              <span className="font-black text-emerald-600">٣ مرات</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between px-3">
              <span className="opacity-80 font-bold">ربط الآيات:</span>
              <span className="font-black text-emerald-600">مفعل</span>
            </div>
            <div className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-between px-3">
              <span className="opacity-80 font-bold">السكتة:</span>
              <span className="font-black text-emerald-600">١ ثانية</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 5. زر بدء جلسة التحفيظ */}
      <Hotspot onClick={() => onInspect({
        title: 'زر بدء جلسة التحفيظ والترديد',
        purpose: 'يطلق جلسة التحفيظ الصوتية التفاعلية مع تظليل الآيات والاستماع وتكرار المقاطع وفق الإعدادات المحددة.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 bg-emerald-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xs"
          style={{ borderColor: isBlackTheme ? '#ffffff' : '#059669' }}
        >
          <Play size={18} className="fill-white" />
          <span>بدء جلسة التحفيظ والترديد</span>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 16. صفحة مربّي العبادات (HabitTracker)
// =============================================================
export const HabitTrackerMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. بطاقة تقدم اليوم وإحصائيات الإنجاز */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة إنجاز العبادات اليومية',
        purpose: 'تعرض النسبة المئوية لإنجازك لعبادات اليوم المبارك، مع ملخص مقارنة بأداء الأيام السابقة لتحفيزك على الاستمرار والإتقان.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <Award className="text-amber-500 w-4 h-4" />
              <h3 className="font-black text-sm sm:text-base font-kufi">إنجاز اليوم ٨٥٪</h3>
            </div>
            <p className="text-xs opacity-75 font-bold">بقيت طاعات يسيرة لاكتمال يومك</p>
          </div>
          <div className="w-14 h-14 rounded-full border-4 border-emerald-500 flex items-center justify-center font-black text-base font-mono text-emerald-600 dark:text-emerald-400">
            85%
          </div>
        </div>
      </Hotspot>

      {/* 2. شريط التاريخ وتحديد اليوم */}
      <Hotspot onClick={() => onInspect({
        title: 'شريط تقليب وتحديد التاريخ',
        purpose: 'يتيح لك استعراض أيام الأسبوع وتسجيل أو مراجعة العبادات لأي يوم سابق أو قادم مع عرض التاريخ الهجري والميلادي.'
      })}>
        <div 
          className="p-2 px-3 rounded-2xl border-2 flex items-center justify-between text-xs font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <ChevronRight size={18} className="opacity-60" />
          <span>اليوم • الأحد ١٦ ربيع الآخر ١٤٤٨ هـ</span>
          <ChevronLeft size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 3. بطاقات الصلوات الخمس والسنن الرواتب */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقات الصلوات الخمس وسننها الرواتب',
        purpose: 'تمكنك من تسجيل أداء كل فريضة في وقتها وجماعة، مع زر خاص بتسجيل السنن الرواتب والنوافل المرتبطة بها.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex flex-col gap-2 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">الصلوات المكتوبة والسنن</span>
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="font-bold text-xs">صلاة الفجر</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">الفريضة ✓</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">السنة ✓</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="font-bold text-xs">صلاة الظهر</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">الفريضة ✓</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">السنن ✓</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="font-bold text-xs">صلاة العصر</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">الفريضة ✓</span>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 4. بطاقات الأذكار والورد القرآني */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقات الأذكار وورد القرآن اليومي',
        purpose: 'تسجل التزامك بأذكار الصباح والمساء، أذكار النوم والاستيقاظ، وورد تلاوة القرآن الكريم مع حساب أيام الاستمرار.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex flex-col gap-2 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">الأذكار والقرآن</span>
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="font-bold text-xs">أذكار الصباح والمساء</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">منجز 🔥 ٥ أيام</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
            <span className="font-bold text-xs">ورد القرآن الكريم اليومي</span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-white">منجز 🔥 ٧ أيام</span>
          </div>
        </div>
      </Hotspot>

      {/* 5. زر إضافة عبادة مخصصة */}
      <Hotspot onClick={() => onInspect({
        title: 'زر إضافة عبادة مخصصة جديدة',
        purpose: 'يمكنك من إضافة أي طاعة أو عمل صالح خاص بك (مثل صيام الاثنين والخميس، الصدقة اليومية، صلة الرحم) ومتابعته بانتظام.'
      })}>
        <div 
          className="p-3 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 text-xs font-black shadow-xs opacity-85"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.5)' : '#000000' }}
        >
          <Plus size={16} />
          <span>إضافة عبادة أو عادة شخصية جديدة</span>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 17. صفحة الرقية الشرعية (OthersMockup)
// =============================================================
export const OthersMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. تبويبات الرقية الشرعية */}
      <Hotspot onClick={() => onInspect({
        title: 'تبويبات أقسام الرقية الشرعية',
        purpose: 'تتيح لك التنقل بين آيات الرقية من القرآن الكريم، وأدعية الرقية المأثورة من السنة النبوية، وقائمة الآيات المفضلة لديك.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-center">
            القرآن الكريم
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            السنة النبوية
          </div>
          <div className="flex-1 py-1.5 px-3 text-center opacity-70">
            المفضلة
          </div>
        </div>
      </Hotspot>

      {/* 2. خانة البحث في الرقية */}
      <Hotspot onClick={() => onInspect({
        title: 'خانة البحث في آيات وأدعية الرقية',
        purpose: 'تتيح لك البحث السريع بالكلمات أو المقاصد (مثل آيات السحر، العين، الحسد، الشفاء، السكينة) والوصول الفوري لها.'
      })}>
        <div 
          className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs opacity-80 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span>ابحث في آيات وأدعية الرقية الشرعية...</span>
          <Search size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 3. بطاقة آية الرقية الأولى: سورة الفاتحة */}
      <Hotspot onClick={() => onInspect({
        title: 'سورة الفاتحة (أم الكتاب والشافية)',
        purpose: 'أعظم سورة في القرآن الكريم وأساس الرقية الشرعية التي رقى بها الصحابي اللديغ فشفي بإذن الله، مع أزرار الاستماع الصوتي والنسخ والمشاركة.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              سورة الفاتحة (أم الكتاب والشافية)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
              القرآن الكريم
            </span>
          </div>
          <p className="text-sm font-hafs font-bold leading-loose text-justify">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ (١) الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ (٢) الرَّحْمَٰنِ الرَّحِيمِ (٣) مَالِكِ يَوْمِ الدِّينِ (٤) إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ (٥) اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ (٦)...
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Volume2 size={16} /></div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={15} /></div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Share2 size={15} /></div>
            </div>
            <Heart size={18} className="text-red-500" />
          </div>
        </div>
      </Hotspot>

      {/* 4. بطاقة آية الرقية الثانية: آية الكرسي */}
      <Hotspot onClick={() => onInspect({
        title: 'آية الكرسي (آية التحصين والوقاية العظمى)',
        purpose: 'سيدة آي القرآن الكريم وأعظم آية تحصن المسلم من كل شيطان وسوء، تقرأ دبر كل صلاة وعند النوم للتحصين الكامل.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              آية الكرسي (سورة البقرة ٢٥٥)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/5">
              القرآن الكريم
            </span>
          </div>
          <p className="text-xs sm:text-sm font-hafs font-bold leading-loose text-justify">
            اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ...
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10 text-xs opacity-80">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Volume2 size={16} /></div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={15} /></div>
              <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center"><Share2 size={15} /></div>
            </div>
            <Heart size={18} className="opacity-50" />
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 18. صفحة السيرة والخط الزمني (PropheticSeerahMockup)
// =============================================================
export const PropheticSeerahMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. تبويبات أقسام السيرة النبوية */}
      <Hotspot onClick={() => onInspect({
        title: 'تبويبات السيرة النبوية الشريفة',
        purpose: 'تتيح لك التنقل بين: الخط الزمني لمعالم حياة النبي ﷺ، مواقف خالدة من أخلاقه وسيرته، واستعراض شجرة نسبه الشريف ﷺ.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-center">
            الخط الزمني
          </div>
          <div className="flex-1 py-1.5 px-2 text-center opacity-70">
            مواقف خالدة
          </div>
          <div className="flex-1 py-1.5 px-2 text-center opacity-70">
            نسبه الشريف ﷺ
          </div>
        </div>
      </Hotspot>

      {/* 2. بطاقة الحدث الأول: المولد النبوي الشريف */}
      <Hotspot onClick={() => onInspect({
        title: 'المعلم الأول: مولد النبي المصطفى ﷺ',
        purpose: 'يوثق تفاصيل ميلاد خير البرية نبينا محمد ﷺ بمكة المكرمة في عام الفيل، نشأته المباركة يتيماً، ورضاعته في بني سعد.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
              المرحلة المكية
            </span>
            <span className="text-xs opacity-75 font-bold">١٢ ربيع الأول عام الفيل</span>
          </div>
          <h4 className="font-black text-base font-kufi">مولد الحبيب المصطفى ﷺ</h4>
          <p className="text-xs opacity-80 leading-relaxed font-bold">
            مولد نبي الهدى محمد بن عبد الله بن عبد المطلب بمكة المكرمة في عام الفيل (٥٧١ م)، وإشراق نور النبوة على العالمين.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs opacity-75">
            <span>📍 مكة المكرمة</span>
            <span>عمره الشريف: ٠ سنة</span>
          </div>
        </div>
      </Hotspot>

      {/* 3. بطاقة الحدث الثاني: نزول الوحي والبعثة النبوية */}
      <Hotspot onClick={() => onInspect({
        title: 'المعلم الثاني: نزول الوحي الشريف وبدء البعثة',
        purpose: 'يوثق لقاء النبي ﷺ بجبريل عليه السلام في غار حراء في شهر رمضان، ونزول أول آيات الذكر الحكيم: «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ».'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">
              بدء النبوة
            </span>
            <span className="text-xs opacity-75 font-bold">شهر رمضان (٦١٠ م)</span>
          </div>
          <h4 className="font-black text-base font-kufi">نزول الوحي في غار حراء</h4>
          <p className="text-xs opacity-80 leading-relaxed font-bold">
            هبوط أمين الوحي جبريل عليه السلام بالآيات الأولى من سورة العلق وتكليفه بالرسالة الخالدة رحمة للعالمين.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs opacity-75">
            <span>📍 غار حراء • جبل النور</span>
            <span>عمره الشريف: ٤٠ سنة</span>
          </div>
        </div>
      </Hotspot>

      {/* 4. بطاقة الحدث الثالث: الهجرة النبوية المباركة */}
      <Hotspot onClick={() => onInspect({
        title: 'المعلم الثالث: الهجرة النبوية الشريفة إلى المدينة',
        purpose: 'يوثق خروج النبي ﷺ وصاحبه الصديق رضي الله عنه من مكة إلى يثرب، وتأسيس أول دولة إسلامية وبناء المسجد النبوي الشريف.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600">
              المرحلة المدنية
            </span>
            <span className="text-xs opacity-75 font-bold">١ هـ (٦٢٢ م)</span>
          </div>
          <h4 className="font-black text-base font-kufi">الهجرة النبوية المباركة</h4>
          <p className="text-xs opacity-80 leading-relaxed font-bold">
            انطلاق الهجرة الكبرى من مكة إلى المدينة المنورة وبداية التاريخ الهجري ومؤاخاة المهاجرين والأنصار.
          </p>
          <div className="flex items-center justify-between pt-1 border-t border-black/10 text-xs opacity-75">
            <span>📍 المدينة المنورة</span>
            <span>عمره الشريف: ٥٣ سنة</span>
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 19. صفحة المواقع الإسلامية (IslamicSitesMockup)
// =============================================================
export const IslamicSitesMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. خانة البحث عن المواقع الموثوقة */}
      <Hotspot onClick={() => onInspect({
        title: 'خانة البحث في المواقع الإسلامية',
        purpose: 'تتيح لك البحث السريع باسم الموقع أو مجاله (تفسير، حديث، فتاوى، كتب، تاريخ) للعثور على المنصات الموثوقة فورياً.'
      })}>
        <div 
          className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs opacity-80 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span>ابحث في المواقع الإسلامية الموثوقة...</span>
          <Search size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 2. بطاقة الموقع الأول: مجمع الملك فهد لطباعة المصحف الشريف */}
      <Hotspot onClick={() => onInspect({
        title: 'مجمع الملك فهد لطباعة المصحف الشريف',
        purpose: 'المصدر الرسمي المعتمد لأصح المصاحف والروايات القرآنية والخطوط الحاسوبية العثمانية المعتمدة عالمياً مع أزرار الزيارة والنسخ.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              مجمع الملك فهد لطباعة المصحف الشريف
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              المصاحف الرسمية
            </span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed font-bold">
            البوابة العالمية لأصح إصدارات القرآن الكريم بالروايات المتواترة والترجمات المعتمدة لكافة لغات العالم.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-[11px] font-mono opacity-60">qurancomplex.gov.sa</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                <ArrowUpRight size={12} />
                زيارة الموقع
              </span>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={13} /></div>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Share2 size={13} /></div>
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 3. بطاقة الموقع الثاني: موسوعة الدرر السنية */}
      <Hotspot onClick={() => onInspect({
        title: 'موقع الدرر السنية (الموسوعة الحديثية)',
        purpose: 'أضخم منصة ومحرك بحث للتحقق من صحة وتخريج الأحاديث النبوية الشريفة وأقوال أئمة الجرح والتعديل المعتمدة.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              الدرر السنية (الموسوعة الحديثية)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600">
              تخريج الحديث
            </span>
          </div>
          <p className="text-xs opacity-80 leading-relaxed font-bold">
            محرك بحث متخصص يتيح البحث في كتب السنة النبوية وتخريج صحة وضعف الأحاديث بنقرة واحدة.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-[11px] font-mono opacity-60">dorar.net</span>
            <div className="flex items-center gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-black flex items-center gap-1">
                <ArrowUpRight size={12} />
                زيارة الموقع
              </span>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={13} /></div>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Share2 size={13} /></div>
            </div>
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 20. صفحة الأربعون النووية (NawawiMockup)
// =============================================================
export const NawawiMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. خانة البحث في الأحاديث */}
      <Hotspot onClick={() => onInspect({
        title: 'خانة البحث في الأربعين النووية',
        purpose: 'تتيح لك البحث في نصوص الأحاديث وشروحها والراوي وأبواب الإيمان والأعمال الصالحة بدقة وسرعة.'
      })}>
        <div 
          className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs opacity-80 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span>ابحث في الأحاديث النبوية وشروحها...</span>
          <Search size={18} className="opacity-60" />
        </div>
      </Hotspot>

      {/* 2. بطاقة الحديث الأول: إنما الأعمال بالنيات */}
      <Hotspot onClick={() => onInspect({
        title: 'الحديث الأول: إنما الأعمال بالنيات',
        purpose: 'أصل عظيم من أصول الإسلام وقاعدة الأعمال؛ رواه أمير المؤمنين عمر بن الخطاب رضي الله عنه مع ميزة استماع الشرح الصوتي والفوائد.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              الحديث الأول: إنما الأعمال بالنيات
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              رقم ١
            </span>
          </div>
          <span className="text-[11px] opacity-75 font-bold">عن أمير المؤمنين عمر بن الخطاب رضي الله عنه</span>
          <p className="text-xs sm:text-sm font-hafs font-bold leading-loose text-justify">
            «سمعتُ رسولَ اللهِ ﷺ يقولُ: إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ...»
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">عرض الفوائد والشرح</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Volume2 size={14} /></div>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={14} /></div>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Share2 size={14} /></div>
              <Heart size={16} className="text-red-500" />
            </div>
          </div>
        </div>
      </Hotspot>

      {/* 3. بطاقة الحديث الثاني: حديث جبريل في مراتب الدين */}
      <Hotspot onClick={() => onInspect({
        title: 'الحديث الثاني: حديث جبريل عليه السلام',
        purpose: 'أم السنة النبوية؛ يوضح أركان الإسلام الخمسة، وأركان الإيمان الستة، ومرتبة الإحسان وعلامات الساعة الكبرى والصغرى.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-black font-kufi text-emerald-600 dark:text-emerald-400">
              الحديث الثاني: مراتب الدين (الإسلام والإيمان والإحسان)
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
              رقم ٢
            </span>
          </div>
          <p className="text-xs sm:text-sm font-hafs font-bold leading-loose text-justify">
            «بينما نحن جلوس عند رسول الله ﷺ ذات يوم إذ طلع علينا رجل شديد بياض الثياب شديد سواد الشعر لا يُرى عليه أثر السفر...»
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-black/10">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">عرض الفوائد والشرح</span>
            <div className="flex items-center gap-1.5 opacity-80">
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Volume2 size={14} /></div>
              <div className="w-7 h-7 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center"><Copy size={14} /></div>
              <Heart size={16} className="opacity-50" />
            </div>
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 21. صفحة الحاسبة الشرعية (CalculatorsMockup)
// =============================================================
export const CalculatorsMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. تبويبات الحاسبات الأربعة */}
      <Hotspot onClick={() => onInspect({
        title: 'شريط تبويبات الحاسبة الشرعية',
        purpose: 'يتيح لك الانتقال بين حساب زكاة المال وعروض التجارة، وتوزيع المواريث الشرعية، وكفارات اليمين والصيام، وزكاة الفطر والأضحية.'
      })}>
        <div 
          className="p-1.5 rounded-2xl border-2 flex items-center justify-between text-xs font-bold shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
        >
          <div className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-black text-center">
            حاسبة الزكاة
          </div>
          <div className="flex-1 py-1.5 px-2 text-center opacity-70">
            المواريث
          </div>
          <div className="flex-1 py-1.5 px-2 text-center opacity-70">
            الكفارات
          </div>
          <div className="flex-1 py-1.5 px-2 text-center opacity-70">
            فطر وأضحية
          </div>
        </div>
      </Hotspot>

      {/* 2. بطاقة النصاب وسعر الذهب الحالي */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة نصاب الزكاة الشرعي وسعر الذهب',
        purpose: 'تحسب نصاب الزكاة الشرعي تلقائياً بناءً على قيمة ٨٥ جراماً من الذهب الخالص عيار ٢٤ لحساب بلوغ النصاب بدقة.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div>
            <span className="text-[10px] font-bold text-emerald-600">النصاب الشرعي (٨٥ جرام ذهب)</span>
            <h4 className="font-black text-base font-mono mt-0.5">٣,٢٠٠ ج.م / جرام</h4>
          </div>
          <div className="text-left font-mono">
            <span className="text-[10px] opacity-60 block">قيمة النصاب</span>
            <span className="font-black text-sm text-amber-600">٢٧٢,٠٠٠ ج.م</span>
          </div>
        </div>
      </Hotspot>

      {/* 3. حقول مدخلات الأموال والأرصدة */}
      <Hotspot onClick={() => onInspect({
        title: 'حقول إدخال الأموال والمدخرات والديون',
        purpose: 'خانات مخصصة لكتابة السيولة النقدية، وقيمة عروض التجارة، وقيمة الذهب المدخر، مع خصم الديون العاجلة الواجبة عليك.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2.5 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span className="font-black text-xs text-emerald-600">الأموال والمدخرات المحسوبة</span>
          
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
            <span className="font-bold opacity-80">السيولة النقدية والودائع البنكية:</span>
            <span className="font-black font-mono">٣٠٠,٠٠٠ ج.م</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
            <span className="font-bold opacity-80">عروض التجارة والبضائع:</span>
            <span className="font-black font-mono">٥٠,٠٠٠ ج.م</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/5 dark:bg-white/5 text-xs">
            <span className="font-bold opacity-80">الديون المستحقة عليك (تخصم):</span>
            <span className="font-black font-mono text-red-500">- ٢٠,٠٠٠ ج.م</span>
          </div>
        </div>
      </Hotspot>

      {/* 4. زر الحساب والنتيجة النهائية */}
      <Hotspot onClick={() => onInspect({
        title: 'زر حساب الزكاة ونتيجة المبلغ الواجب إخراجه',
        purpose: 'يقوم بحساب نسبة الزكاة الشرعية (٢.٥٪ ربع العشر) على صافي وعاء الزكاة البالغ للنصاب والذي حال عليه الحول.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 bg-emerald-600 text-white flex items-center justify-between shadow-xs font-black"
          style={{ borderColor: isBlackTheme ? '#ffffff' : '#059669' }}
        >
          <div className="flex items-center gap-2">
            <Calculator size={20} />
            <span className="text-sm font-kufi">إجمالي الزكاة الواجبة فوراً:</span>
          </div>
          <span className="text-lg font-mono">٨,٢٥٠ ج.م</span>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 22. صفحة التحكم الصوتي (VoiceControlMockup)
// =============================================================
export const VoiceControlMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. بطاقة زر الميكروفون وحالة التحكم الصوتي */}
      <Hotspot onClick={() => onInspect({
        title: 'زر الميكروفون المركزي وحالة الاستماع',
        purpose: 'الزر الرئيسي لتفعيل أو تعطيل الاستماع الصوتي الدائم؛ يتيح لك نطق الأوامر والتحكم في كامل التطبيق دون لمس الشاشة.'
      })}>
        <div 
          className="p-5 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 text-center shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg animate-pulse">
            <Mic size={32} />
          </div>
          <div>
            <h3 className="font-black text-base font-kufi">التحكم الصوتي مفعل</h3>
            <p className="text-xs opacity-75 mt-0.5 font-bold">يمكنك التحدث بالأوامر من أي مكان في التطبيق</p>
          </div>
          <div className="p-2.5 px-4 rounded-xl bg-black/5 dark:bg-white/5 border border-black/10 text-xs font-mono font-bold">
            «اقرأ سورة البقرة»
          </div>
        </div>
      </Hotspot>

      {/* 2. مفتاح إظهار الأيقونة العائمة */}
      <Hotspot onClick={() => onInspect({
        title: 'مفتاح إظهار أيقونة التحكم الصوتي العائمة',
        purpose: 'يظهر أيقونة مايكروفون عائمة في أسفل الصفحة الرئيسية للوصول السريع والتحكم الصوتي بلمسة واحدة.'
      })}>
        <div 
          className="p-3.5 rounded-2xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div>
            <h4 className="font-black text-xs sm:text-sm">أيقونة التحكم الصوتي</h4>
            <p className="text-[10px] opacity-60 mt-0.5 font-bold">إظهار الأيقونة في الصفحة الرئيسية</p>
          </div>
          <div className="w-10 h-6 rounded-full bg-emerald-500 p-0.5 flex items-center justify-end">
            <div className="w-5 h-5 rounded-full bg-white shadow-xs"></div>
          </div>
        </div>
      </Hotspot>

      {/* 3. قائمة الأوامر الصوتية الجاهزة */}
      <Hotspot onClick={() => onInspect({
        title: 'قائمة الأوامر الصوتية المدعومة',
        purpose: 'تعرض جميع الكلمات والعبارات التي يستجيب لها التطبيق فورياً للتنقل بين الصفحات وتشغيل التلاوات والأذكار.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex flex-col gap-2 shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <span className="font-black text-xs text-emerald-600 dark:text-emerald-400">أمثلة على الأوامر الصوتية:</span>
          
          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold">
            <span>"مواقيت الصلاة"</span>
            <span className="opacity-60 text-[10px]">يفتح مواقيت الصلاة والأذان</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold">
            <span>"افتح السبحة"</span>
            <span className="opacity-60 text-[10px]">يفتح السبحة الإلكترونية</span>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5 text-xs font-bold">
            <span>"أذكار الصباح"</span>
            <span className="opacity-60 text-[10px]">يفتح أذكار الصباح</span>
          </div>
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 23. صفحة أسماء الله الحسنى (AsmaulHusnaMockup)
// =============================================================
export const AsmaulHusnaMockup: React.FC<PageMockupProps> = ({
  onInspect, isBlackTheme, textColor, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3 py-1 select-none" dir="rtl">
      
      {/* 1. شريط البحث والتبديل بين الشبكة وقائمة الشرح */}
      <div className="flex items-center gap-2">
        <Hotspot 
          className="flex-1"
          onClick={() => onInspect({
            title: 'خانة البحث في أسماء الله الحسنى',
            purpose: 'تتيح لك البحث بالاسم الشريف أو بالمعنى اللغوي والشرعي أو بالدليل من القرآن الكريم والسنة النبوية.'
          })}
        >
          <div 
            className="p-3 rounded-2xl border-2 flex items-center justify-between text-xs opacity-80 shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span>ابحث بالاسم أو المعنى...</span>
            <Search size={18} className="opacity-60" />
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر التبديل بين عرض الشبكة وقائمة الشرح',
          purpose: 'يتيح لك استعراض أسماء الله الحسنى إما كبطاقات شبكية أنيقة، أو كقائمة تفصيلية مطولة تعرض الشرح والدليل القرآني لكل اسم.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex items-center justify-center gap-1 text-xs font-bold shadow-xs"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000' }}
          >
            <LayoutGrid size={16} />
            <span className="text-[10px]">الشبكة</span>
          </div>
        </Hotspot>
      </div>

      {/* 2. شبكة أسماء الله الحسنى (6 بطاقات تفاعلية) */}
      <div className="grid grid-cols-3 gap-2">
        {/* الله */}
        <Hotspot onClick={() => onInspect({
          title: 'اسم الله الأعظم: «اللَّه»',
          purpose: 'الإله الحق الجامع لصفات الكمال ونعوت الجلال، ذو الألوهية والعبودية على خلقه أجمعين، وبالنقر عليه يمكنك الاستماع للنطق والشرح والدليل.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">١</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">اللَّه</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">الجامع لصفات الكمال</span>
          </div>
        </Hotspot>

        {/* الرَّحْمَٰنُ */}
        <Hotspot onClick={() => onInspect({
          title: 'الاسم الثاني: «الرَّحْمَٰن»',
          purpose: 'ذو الرحمة الواسعة الشاملة لجميع الخلائق في الدنيا وللمؤمنين في الآخرة، وهو اسم مختص بالله تعالى لا يجوز إطلاقه على غيره.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">٢</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">الرَّحْمَٰنُ</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">واسع الرحمة بخلقه</span>
          </div>
        </Hotspot>

        {/* الرَّحِيمُ */}
        <Hotspot onClick={() => onInspect({
          title: 'الاسم الثالث: «الرَّحِيم»',
          purpose: 'دائم الرحمة بالمؤمنين؛ يفيض عليهم من ألطافه وهدايته وتوفيقه في الدنيا، ويكرمهم بالجنة والرضوان في الآخرة.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">٣</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">الرَّحِيمُ</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">الراحم بالمؤمنين</span>
          </div>
        </Hotspot>

        {/* الْمَلِكُ */}
        <Hotspot onClick={() => onInspect({
          title: 'الاسم الرابع: «الْمَلِك»',
          purpose: 'المتصرف في ملكه كيف يشاء، ذو الملك الحقيقي الكامل الذي لا يزول، وخالق كل شيء ومدبر أمر الكون بأسره.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">٤</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">الْمَلِكُ</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">المتصرف في ملكه</span>
          </div>
        </Hotspot>

        {/* الْقُدُّوسُ */}
        <Hotspot onClick={() => onInspect({
          title: 'الاسم الخامس: «الْقُدُّوس»',
          purpose: 'المنزه عن كل عيب ونقص، الموصوف بنعوت الجلال والكمال، المطهر الذي تسبح له الملائكة والخلائق أجمعين.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">٥</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">الْقُدُّوسُ</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">المنزه عن كل عيب</span>
          </div>
        </Hotspot>

        {/* السَّلَامُ */}
        <Hotspot onClick={() => onInspect({
          title: 'الاسم السادس: «السَّلَام»',
          purpose: 'السالم من كل نقص وعيب، وواهب الأمن والسلام والسكينة لعباده، وتحية أهل الجنة من رب رحيم.'
        })}>
          <div 
            className="p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center aspect-square shadow-xs relative"
            style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
          >
            <span className="text-[9px] font-bold opacity-60 absolute top-2 right-2">٦</span>
            <h4 className="font-black text-xl font-amiri text-amber-700 dark:text-amber-400">السَّلَامُ</h4>
            <span className="text-[9px] opacity-70 mt-1 font-bold">واهب الأمن والسلام</span>
          </div>
        </Hotspot>
      </div>

      {/* 3. بطاقة عرض التفاصيل والأدلة */}
      <Hotspot onClick={() => onInspect({
        title: 'بطاقة شرح الاسم والأدلة من القرآن والسنة',
        purpose: 'تعرض تفاصيل معنى الاسم المختار، واستماع النطق الصوتي الصحيح، والآيات والأحاديث التي ورد فيها الاسم، مع ميزة مشاركة البطاقة كصورة راقية.'
      })}>
        <div 
          className="p-4 rounded-3xl border-2 flex items-center justify-between shadow-xs"
          style={{ backgroundColor: isBlackTheme ? '#141414' : '#ffffff', borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.4)' : '#000000', color: textColor }}
        >
          <div className="flex items-center gap-2">
            <Volume2 className="text-emerald-500 w-5 h-5" />
            <span className="text-xs font-bold">استماع للنطق والمعنى والأدلة القرآنية</span>
          </div>
          <Share2 size={16} className="opacity-60" />
        </div>
      </Hotspot>

    </div>
  );
};

// =============================================================
// 24. صفحة أيقونة التواصل عبر الواتساب (WhatsApp Mockup)
// =============================================================
export const WhatsAppMockup: React.FC<PageMockupProps> = ({
  onInspect, theme, isBlackTheme, primaryAccent, textColor, cardBg, cardBorderColor
}) => {
  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center gap-4 py-2 select-none font-cairo" dir="rtl">
      
      {/* 1. مظهر أيقونة الواتساب في الشاشة الرئيسية بجانب زر السيرة */}
      <Hotspot onClick={() => onInspect({
        title: 'أيقونة التواصل والدعم الفني عبر واتساب (الشاشة الرئيسية)',
        purpose: 'زر اتصال مباشر بفريق تطوير ودعم تطبيق مصحف أحمد وليلى عبر تطبيق واتساب، يتيح لك إرسال الاستفسارات والملاحظات والاقتراحات لتطوير المصحف ومتابعة التحديثات.'
      })}>
        <div className="flex items-center gap-3 p-3 rounded-2xl border shadow-sm w-full max-w-sm justify-between cursor-pointer"
             style={{ backgroundColor: cardBg, borderColor: cardBorderColor, color: textColor }}>
          <div className="flex items-center gap-2.5">
            <div className="w-11 h-11 rounded-full flex items-center justify-center shadow-md bg-[#25D366] text-white">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-sm">أيقونة الواتساب في الشاشة الرئيسية</h4>
              <p className="text-[11px] opacity-70">انقر عليها لفتح نافذة التواصل الفوري</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">نشط 🟢</span>
        </div>
      </Hotspot>

      {/* 2. نافذة وبطاقة التواصل عبر الواتساب المطابقة تماماً للأصلية وبالرقم الفعلي (+966 59 216 6023) */}
      <div 
        className="w-[290px] sm:w-[310px] rounded-3xl p-6 shadow-2xl border text-center relative transition-all"
        style={{ 
          backgroundColor: isBlackTheme ? '#18181b' : '#ffffff', 
          borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : '#e5e7eb',
          color: textColor
        }}
      >
        {/* زر الإغلاق الدائري (×) */}
        <Hotspot onClick={() => onInspect({
          title: 'زر إغلاق نافذة الواتساب (×)',
          purpose: 'يغلق نافذة التواصل السريع والعودة إلى الشاشة الرئيسية للتطبيق.'
        })}>
          <div className="absolute top-3 left-3 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all cursor-pointer">
            <span className="text-xl font-bold leading-none">×</span>
          </div>
        </Hotspot>

        {/* أيقونة الواتساب الخضراء الكبيرة */}
        <Hotspot onClick={() => onInspect({
          title: 'شعار وأيقونة تطبيق واتساب (WhatsApp)',
          purpose: 'يشير إلى قناة التواصل المباشر عبر تطبيق واتساب لمراسلة الدعم الفني ومطور التطبيق فوراً.'
        })}>
          <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/50 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner cursor-pointer">
            <svg className="w-8 h-8 text-emerald-500" viewBox="0 0 24 24">
              <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </Hotspot>

        {/* عنوان التواصل والاقتراحات */}
        <Hotspot onClick={() => onInspect({
          title: 'عنوان للتواصل والاقتراحات',
          purpose: 'مخصص لاستقبال كافة اقتراحات المستخدمين، الأفكار الجديدة لتطوير المصحف، وبلاغات الأخطاء أو الاستفسارات الشرعية والتقنية.'
        })}>
          <h3 className="font-black text-lg text-emerald-600 dark:text-emerald-400 mb-1 cursor-pointer">
            للتواصل والاقتراحات
          </h3>
        </Hotspot>

        {/* اسم المطور والمسؤول (علاء أحمد) */}
        <Hotspot onClick={() => onInspect({
          title: 'اسم المطور ومسؤول التطبيق (علاء أحمد)',
          purpose: 'يعرض اسم المشرف ومطور التطبيق (علاء أحمد) المتاح للتواصل والمتابعة المباشرة معك.'
        })}>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold mb-4 cursor-pointer">
            علاء أحمد
          </p>
        </Hotspot>

        {/* زر تواصل عبر الواتساب */}
        <Hotspot onClick={() => onInspect({
          title: 'زر تواصل عبر الواتساب (فتح المحادثة)',
          purpose: 'يقوم بفتح تطبيق واتساب فوراً محولاً المحادثة مباشرة إلى رقم الهاتف المخصص (+966 59 216 6023) لبدء الدردشة دون الحاجة لتسجيل الرقم في جهات اتصالك أولاً.'
        })}>
          <div 
            className="w-full text-white font-bold py-3 px-4 rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 active:scale-95"
            style={{ backgroundColor: primaryAccent }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>تواصل عبر الواتساب</span>
          </div>
        </Hotspot>

        {/* رقم الهاتف المطابق تماماً للأصل (+966 59 216 6023) */}
        <Hotspot onClick={() => onInspect({
          title: 'رقم هاتف الواتساب المعتمد للتواصل',
          purpose: 'رقم التواصل الرسمي المباشر للدعم الفني والتطوير (+966 59 216 6023) للاستفسارات والمقترحات ومتابعة التحديثات.'
        })}>
          <div className="mt-3 py-1.5 px-3 rounded-lg bg-gray-50 dark:bg-zinc-800/60 inline-flex items-center gap-1.5 cursor-pointer">
            <span className="text-xs text-gray-500 dark:text-gray-400">📞</span>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 font-mono tracking-wider" dir="ltr">
              +966 59 216 6023
            </span>
          </div>
        </Hotspot>
      </div>

      {/* 3. ميزات وبطاقات الدعم الإضافية عبر واتساب */}
      <div className="w-full max-w-sm flex flex-col gap-2">
        <Hotspot onClick={() => onInspect({
          title: 'بطاقة الدعم الفني الفوري والرد على الاستفسارات',
          purpose: 'إرسال أي مشكلة تقنية تواجهك في التطبيق أو استفسار بخصوص مواقيت الصلاة أو التلاوات لتحصل على حل وإرشاد سريع ومباشر من المطورين.'
        })}>
          <div className="p-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.01] cursor-pointer"
               style={{ backgroundColor: cardBg, borderColor: cardBorderColor, color: textColor }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Shield size={20} />
            </div>
            <div className="flex-1 text-right">
              <h5 className="font-bold text-xs">دعم فني فوري واستجابة سريعة</h5>
              <p className="text-[11px] opacity-75">حل المشكلات والرد على استفسارات المستخدمين</p>
            </div>
          </div>
        </Hotspot>

        <Hotspot onClick={() => onInspect({
          title: 'زر مشاركة ونشر التطبيق كصدقة جارية',
          purpose: 'مشاركة رابط التطبيق ومحتوياته الإيمانية مع جهات اتصالك ومجموعاتك على واتساب لتنال أجر كل من قرأ حرفاً أو سبّح أو صلى.'
        })}>
          <div className="p-3 rounded-2xl border flex items-center gap-3 transition-all hover:scale-[1.01] cursor-pointer"
               style={{ backgroundColor: cardBg, borderColor: cardBorderColor, color: textColor }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Share2 size={20} />
            </div>
            <div className="flex-1 text-right">
              <h5 className="font-bold text-xs">نشر التطبيق كصدقة جارية</h5>
              <p className="text-[11px] opacity-75">مشاركة رابط التطبيق مع أحبائك في مجموعات الواتساب</p>
            </div>
          </div>
        </Hotspot>
      </div>

    </div>
  );
};

// =============================================================
// مجمّع وموجه الصفحات (PageMockupDispatcher)
// =============================================================
export const PageMockupDispatcher: React.FC<{
  pageId: string;
  onInspect: (data: ButtonExplanationData) => void;
  theme: any;
  themeKey?: string;
  isBlackTheme: boolean;
  primaryAccent: string;
  textColor: string;
  cardBg: string;
  cardBorderColor: string;
}> = (props) => {
  const { language } = useLanguage();
  const isEn = language === 'en';

  // Wrap onInspect so any data passed from any mockup is translated if in English
  const localizedOnInspect = (data: ButtonExplanationData) => {
    if (isEn) {
      props.onInspect(translateExplanationData(data, 'en'));
    } else {
      props.onInspect(data);
    }
  };

  const localizedProps = {
    ...props,
    onInspect: localizedOnInspect,
  };

  let MockupComponent: React.FC<PageMockupProps>;
  switch (props.pageId) {
    case 'tasbeeh':
      MockupComponent = TasbeehMockup;
      break;
    case 'community':
    case 'side-community':
      MockupComponent = CommunityMockup;
      break;
    case 'adia':
      MockupComponent = AdiaMockup;
      break;
    case 'salah-adhkar':
      MockupComponent = AthkarAlSalahMockup;
      break;
    case 'hisn-muslim':
      MockupComponent = HisnAlmuslimMockup;
      break;
    case 'calendar':
      MockupComponent = CalendarMockup;
      break;
    case 'sabah-masaa':
      MockupComponent = SabahMasaaMockup;
      break;
    case 'prayer-times':
      MockupComponent = PrayerTimesMockup;
      break;
    case 'qibla':
      MockupComponent = QiblaMockup;
      break;
    case 'listen':
      MockupComponent = ListenQuranMockup;
      break;
    case 'ahl-al-quran':
    case 'side-ahl-al-quran':
      MockupComponent = AhlAlQuranMockup;
      break;
    case 'quran':
      MockupComponent = QuranReaderMockup;
      break;
    case 'hajj-umrah':
      MockupComponent = HajjUmrahMockup;
      break;
    case 'daily-wird':
      MockupComponent = DailyWirdMockup;
      break;
    case 'memorization':
      MockupComponent = MemorizationMockup;
      break;
    case 'habit-tracker':
      MockupComponent = HabitTrackerMockup;
      break;
    case 'others':
      MockupComponent = OthersMockup;
      break;
    case 'prophetic-seerah':
      MockupComponent = PropheticSeerahMockup;
      break;
    case 'islamic-sites':
      MockupComponent = IslamicSitesMockup;
      break;
    case 'nawawi':
      MockupComponent = NawawiMockup;
      break;
    case 'calculators':
      MockupComponent = CalculatorsMockup;
      break;
    case 'voice-control':
    case 'side-voice':
      MockupComponent = VoiceControlMockup;
      break;
    case 'asmaul-husna':
      MockupComponent = AsmaulHusnaMockup;
      break;
    case 'side-whatsapp':
      MockupComponent = WhatsAppMockup;
      break;
    default:
      MockupComponent = TasbeehMockup;
      break;
  }

  // Directly call the mockup component to get its real JSX elements
  const rawElement = MockupComponent(localizedProps) as React.ReactElement;

  if (isEn) {
    return (
      <div dir="ltr" className="w-full font-sans">
        {translateTree(rawElement, 'en')}
      </div>
    );
  }

  return (
    <div dir="rtl" className="w-full font-kufi">
      {rawElement}
    </div>
  );
};

