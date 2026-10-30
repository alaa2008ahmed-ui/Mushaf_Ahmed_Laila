import React, { useState } from 'react';
import { 
  Moon, 
  Copy, 
  Share2, 
  ChevronLeft, 
  ChevronRight, 
  Check
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface IslamicEventItem {
  name: string;
  dateStr: string;
  gregorianDateStr: string;
  daysRemaining: number;
  isToday: boolean;
}

interface IslamicEventsCardProps {
  events: IslamicEventItem[];
  currentIndex: number;
  onPrevEvent: (e: React.MouseEvent) => void;
  onNextEvent: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onOpenModal: () => void;
}

export const IslamicEventsCard: React.FC<IslamicEventsCardProps> = ({
  events,
  currentIndex,
  onPrevEvent,
  onNextEvent,
  onCopy,
  onShare,
  onOpenModal,
}) => {
  const { language, isRTL, dir, t, translateEventName, formatNumber } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const currentEvent = events[currentIndex];
  if (!currentEvent) return null;

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(e);
  };

  // Remaining days text
  let badgeText = '';
  if (currentEvent.isToday) {
    badgeText = t('islamic_events.today', 'اليوم');
  } else if (currentEvent.daysRemaining > 0) {
    badgeText = language === 'en'
      ? `${formatNumber(currentEvent.daysRemaining)} days remaining`
      : `باقي ${formatNumber(currentEvent.daysRemaining)} يوم`;
  } else {
    badgeText = language === 'en'
      ? `Passed ${formatNumber(Math.abs(currentEvent.daysRemaining))} days ago`
      : `مر عليها ${formatNumber(Math.abs(currentEvent.daysRemaining))} يوم`;
  }

  return (
    <div
      id="islamic-events-card"
      dir={dir}
      onClick={onOpenModal}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenModal();
        }
      }}
      className={`w-full p-5 sm:p-6 cursor-pointer relative overflow-hidden select-none flex flex-col gap-3.5 ${
        isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white text-slate-800 tactile-3d-card-light'
      }`}
      title={language === 'en' ? 'Click to view all Islamic events' : 'انقر لعرض قائمة المناسبات الإسلامية كاملة'}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

      {/* 1. الترويسة والأدوات (Header & Flat Action Tools) */}
      <div className="flex items-center justify-between w-full relative z-10">
        {/* عنوان المناسبات الإسلامية مع أيقونة الهلال */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.18)' : `${primaryColor}14`,
              color: primaryColor,
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
          </div>
          <span className={`text-xs sm:text-sm font-bold tracking-tight font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
            {t('islamic_events.title', 'المناسبات الإسلامية')}
          </span>
        </div>

        {/* أزرار مجسمة وبارزة ثلاثية الأبعاد */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* زر السابق */}
          <button
            type="button"
            onClick={onPrevEvent}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 ${
              isBlackTheme
                ? 'text-zinc-200 bg-zinc-800 hover:bg-zinc-700'
                : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 2.5px 0 #18181b, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                : '0 2.5px 0 rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('islamic_events.prev', 'المناسبة السابقة')}
            aria-label={t('islamic_events.prev', 'المناسبة السابقة')}
          >
            {isRTL ? <ChevronRight className="w-4 h-4 drop-shadow-xs" /> : <ChevronLeft className="w-4 h-4 drop-shadow-xs" />}
          </button>

          {/* زر التالي */}
          <button
            type="button"
            onClick={onNextEvent}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 ${
              isBlackTheme
                ? 'text-zinc-200 bg-zinc-800 hover:bg-zinc-700'
                : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 2.5px 0 #18181b, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                : '0 2.5px 0 rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('islamic_events.next', 'المناسبة التالية')}
            aria-label={t('islamic_events.next', 'المناسبة التالية')}
          >
            {isRTL ? <ChevronLeft className="w-4 h-4 drop-shadow-xs" /> : <ChevronRight className="w-4 h-4 drop-shadow-xs" />}
          </button>

          {/* زر النسخ */}
          <button
            type="button"
            onClick={handleCopyClick}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 ${
              isBlackTheme
                ? 'text-zinc-200 bg-zinc-800 hover:bg-zinc-700'
                : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 2.5px 0 #18181b, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                : '0 2.5px 0 rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('common.copy', 'نسخ')}
            aria-label={t('common.copy', 'نسخ')}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" strokeWidth={2.6} />
            ) : (
              <Copy className="w-3.5 h-3.5 drop-shadow-xs" strokeWidth={2.4} />
            )}
          </button>

          {/* زر المشاركة */}
          <button
            type="button"
            onClick={onShare}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 ${
              isBlackTheme
                ? 'text-zinc-200 bg-zinc-800 hover:bg-zinc-700'
                : 'text-slate-700 bg-slate-50 hover:bg-slate-100'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 2.5px 0 #18181b, 0 4px 8px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.2)'
                : '0 2.5px 0 rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.08), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('common.share', 'مشاركة')}
            aria-label={t('common.share', 'مشاركة')}
          >
            <Share2 className="w-3.5 h-3.5 drop-shadow-xs" strokeWidth={2.4} />
          </button>
        </div>
      </div>

      {/* 2. عداد الأيام (Pill/Badge بحجم أنيق ولون خلفية خفيف لتمييزه) */}
      <div className="flex items-center justify-center w-full">
        <div 
          className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-full text-xs font-bold tracking-tight transition-colors"
          style={{
            backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}12`,
            color: isBlackTheme ? '#34d399' : primaryColor,
            border: isBlackTheme ? '1px solid rgba(16, 185, 129, 0.3)' : undefined,
          }}
        >
          <span>{badgeText}</span>
        </div>
      </div>

      {/* 3. اسم المناسبة بارز وعريض، وأسفله التاريخ الهجري والميلادي */}
      <div className="flex flex-col items-center justify-center text-center gap-1.5">
        <h4 className={`text-base sm:text-lg font-bold leading-snug font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
          {translateEventName(currentEvent.name)}
        </h4>

        <div className={`flex items-center justify-center gap-2 text-xs font-medium ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
          <span>{currentEvent.dateStr}</span>
          <span className="opacity-40">·</span>
          <span>{currentEvent.gregorianDateStr}</span>
        </div>
      </div>

      {/* مؤشر تفاعلي ناعم للتفاصيل */}
      <div className="w-full flex items-center justify-end text-[11px] font-semibold pt-0.5">
        <span 
          className="flex items-center gap-1 transition-colors"
          style={{ color: primaryColor }}
        >
          {language === 'en' ? 'View all occasions' : 'عرض كافة المناسبات'}
          {isRTL ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </span>
      </div>
    </div>
  );
};

export default IslamicEventsCard;
