import React, { useState } from 'react';
import { 
  CalendarDays, 
  RotateCw, 
  Copy, 
  Share2, 
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getTranslatedEventText } from '../../utils/onThisDayService';

interface OnThisDayCardProps {
  event: {
    year: number;
    text: string;
    textEn?: string;
    dateStr: string;
  };
  onNextEvent: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onOpenModal: () => void;
}

export const OnThisDayCard: React.FC<OnThisDayCardProps> = ({
  event,
  onNextEvent,
  onCopy,
  onShare,
  onOpenModal,
}) => {
  const { language, isRTL, dir, t, formatNumber } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [isRotating, setIsRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  // App primary color (e.g. emerald, warm amber, etc.)
  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
    onNextEvent(e);
  };

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(e);
  };

  const eventContent = language === 'en' 
    ? (event.textEn || getTranslatedEventText(event.text, event.year))
    : event.text;

  return (
    <div
      id="on-this-day-card"
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
      title={language === 'en' ? 'Click to view more details' : 'انقر لعرض تفاصيل الحدث كاملة'}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

      {/* 1. الترويسة والأدوات (Header & Flat Action Tools) */}
      <div className="flex items-center justify-between w-full relative z-10">
        {/* عنوان البطاقة متناسق مع أيقونة التقويم */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.18)' : `${primaryColor}14`,
              color: primaryColor,
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <CalendarDays className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
          </div>
          <span 
            className={`text-xs sm:text-sm font-bold tracking-tight font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}
          >
            {t('on_this_day.title', 'حدث في مثل هذا اليوم')}
          </span>
        </div>

        {/* أزرار مجسمة وبارزة ثلاثية الأبعاد */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* زر حدث آخر / تحديث */}
          <button
            type="button"
            onClick={handleNextClick}
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
            title={t('on_this_day.next_event', 'حدث آخر')}
            aria-label={t('on_this_day.next_event', 'حدث آخر')}
          >
            <RotateCw 
              className={`w-3.5 h-3.5 transition-transform duration-500 drop-shadow-xs ${isRotating ? 'rotate-180' : ''}`} 
              strokeWidth={2.4}
            />
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

      {/* 2. شريط التاريخ (Date Strip / Container) */}
      <div 
        className={`w-full py-2 px-3.5 rounded-xl flex items-center justify-between ${
          isBlackTheme 
            ? 'bg-zinc-800/80 border border-zinc-700/60 text-zinc-300' 
            : 'bg-slate-50 border border-slate-100/80 text-slate-600'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[11px] sm:text-xs font-semibold ${isBlackTheme ? 'text-zinc-300' : 'text-slate-500'}`}>
            {event.dateStr}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-medium ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
            {language === 'en' ? 'Year' : 'عام'}
          </span>
          <span 
            className={`text-xs sm:text-sm font-extrabold font-mono tracking-tight tabular-nums ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}
          >
            {formatNumber(event.year)}
          </span>
          <span className={`text-[10px] sm:text-[11px] font-bold ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
            {language === 'en' ? 'AD' : 'م'}
          </span>
        </div>
      </div>

      {/* 3. تحسين القراءة (Typography مع مسافة أسطر واسعة مريحة للعين ومساحات داخلية متقنة) */}
      <div className="w-full">
        <p 
          className={`text-[14px] sm:text-[15px] font-normal text-justify leading-[1.85] sm:leading-[1.9] tracking-normal break-words ${
            isBlackTheme ? 'text-zinc-200' : 'text-slate-700'
          }`}
          style={{
            wordBreak: 'break-word',
          }}
        >
          {eventContent}
        </p>
      </div>

      {/* مؤشر قراءة ناعم في الأسفل */}
      <div className="w-full flex items-center justify-end text-[11px] font-semibold pt-1 group">
        <span 
          className="flex items-center gap-1 transition-colors"
          style={{ color: primaryColor }}
        >
          {language === 'en' ? 'Read full article' : 'عرض التفاصيل'}
          {isRTL ? (
            <ChevronLeft className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
        </span>
      </div>
    </div>
  );
};

export default OnThisDayCard;
