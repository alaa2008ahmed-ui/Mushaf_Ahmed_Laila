import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Share2, 
  Copy, 
  Check, 
  RotateCw,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { getTranslatedEventText } from '../../utils/onThisDayService';

interface OnThisDayBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    year: number;
    text: string;
    textEn?: string;
    dateStr: string;
  };
  onNextEvent: (e: React.MouseEvent) => void;
  onShare: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
}

export const OnThisDayBottomSheet: React.FC<OnThisDayBottomSheetProps> = ({
  isOpen,
  onClose,
  event,
  onNextEvent,
  onShare,
  onCopy,
}) => {
  const { language, dir, t, formatNumber } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(e);
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    setTimeout(() => setIsRotating(false), 500);
    onNextEvent(e);
  };

  if (!isOpen || !event) return null;

  const eventContent = language === 'en' 
    ? (event.textEn || getTranslatedEventText(event.text, event.year))
    : event.text;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[120] flex flex-col justify-end bg-black/60 backdrop-blur-xs select-none"
        dir={dir}
        onClick={onClose}
      >
        {/* Animated Bottom Sheet */}
        <motion.div
          initial={{ y: '100%', opacity: 0.6 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          className={`w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative ${
            isBlackTheme ? 'bg-[#18181b] border-t border-zinc-800 text-white' : 'bg-white text-slate-800'
          }`}
          style={{
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
          }}
        >
          {/* 1. Drag Handle & Header */}
          <div className="pt-3 px-6 pb-2 shrink-0 flex flex-col items-center">
            {/* مؤشر السحب الصغير (Drag Handle) */}
            <div className={`w-12 h-1.5 rounded-full mb-3 ${isBlackTheme ? 'bg-zinc-700' : 'bg-slate-300'}`} />

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.2)' : `${primaryColor}18`,
                    color: primaryColor,
                  }}
                >
                  <CalendarDays className="w-5 h-5" strokeWidth={2.4} />
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-base sm:text-lg font-bold font-kufi leading-tight ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                    {t('on_this_day.title', 'حدث في مثل هذا اليوم')}
                  </h3>
                  <span className={`text-xs font-medium ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                    {language === 'en' ? 'Historical Islamic & Global Milestones' : 'محطات ووقائع تاريخية خالدة'}
                  </span>
                </div>
              </div>

              {/* زر الإجراء السريع في الترويسة: زر تغيير الحدث */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleNextClick}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                    isBlackTheme
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-600'
                  }`}
                  title={t('on_this_day.next_event', 'حدث آخر')}
                  aria-label={t('on_this_day.next_event', 'حدث آخر')}
                >
                  <RotateCw 
                    className={`w-4 h-4 transition-transform duration-500 ${isRotating ? 'rotate-180' : ''}`} 
                    strokeWidth={2.2}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="overflow-y-auto px-6 py-4 flex flex-col gap-5 flex-1 overscroll-contain">
            
            {/* شريط التاريخ بارز وواضح جداً بلون رمادي/بيج ناعم */}
            <div className={`w-full py-3 px-4 rounded-2xl flex items-center justify-between ${
              isBlackTheme ? 'bg-zinc-800/80 border border-zinc-700/60' : 'bg-slate-50 border border-slate-100'
            }`}>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className={`text-base sm:text-lg font-bold font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                  {event.dateStr}
                </span>
              </div>

              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl shadow-xs border ${
                isBlackTheme ? 'bg-zinc-700 border-zinc-600' : 'bg-white border-slate-100'
              }`}>
                <span className={`text-xs font-semibold font-kufi ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                  {language === 'en' ? 'Year' : 'عام'}
                </span>
                <span className={`text-lg sm:text-xl font-black font-mono tabular-nums ${isBlackTheme ? 'text-white' : 'text-slate-900'}`}>
                  {formatNumber(event.year)}
                </span>
                <span className={`text-xs font-bold ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                  {language === 'en' ? 'AD' : 'م'}
                </span>
              </div>
            </div>

            {/* النص التاريخي بحجم كبير جداً ومسافة أسطر واسعة مريحة لضعاف البصر وكبار السن */}
            <div className={`rounded-2xl p-6 sm:p-7 shadow-xs ${
              isBlackTheme 
                ? 'bg-zinc-900/90 border border-zinc-700/60' 
                : 'bg-[#FAF9F5] border border-stone-200/50'
            }`}>
              <p 
                className={`text-[20px] sm:text-[23px] font-bold font-hafs leading-[2.1] sm:leading-[2.2] tracking-wide text-justify ${
                  isBlackTheme ? 'text-zinc-100' : 'text-slate-800'
                }`}
                style={{
                  wordBreak: 'break-word',
                }}
              >
                {eventContent}
              </p>
            </div>

            {/* شريط معلومات تشجيعي مع زر التبديل لحدث آخر */}
            <div className="flex items-center justify-between px-1">
              <div className={`flex items-center gap-2 text-xs font-semibold ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>{language === 'en' ? 'Reflect upon historical wisdom' : 'عِبر ودروس من التاريخ الإسلامي'}</span>
              </div>

              <button
                type="button"
                onClick={handleNextClick}
                className={`text-xs sm:text-sm font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  isBlackTheme ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <span>{t('on_this_day.next_event', 'عرض حدث آخر')}</span>
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* 3. Sticky Bottom Actions (Never Cut Off / Full-width Buttons) */}
          <div 
            className={`sticky bottom-0 pt-3 pb-7 sm:pb-8 px-6 shrink-0 flex flex-col gap-2.5 ${
              isBlackTheme
                ? 'bg-[#18181b]/95 backdrop-blur-md border-t border-zinc-800 shadow-[0_-8px_20px_rgba(0,0,0,0.6)]'
                : 'bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-[0_-8px_20px_rgba(0,0,0,0.04)]'
            }`}
          >
            <div className="flex items-center gap-3 w-full">
              {/* زر المشاركة العريض والبارز */}
              <button
                type="button"
                onClick={onShare}
                className="flex-1 h-13 sm:h-14 rounded-2xl font-bold text-base sm:text-lg text-white flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                <Share2 className="w-5 h-5" />
                <span>{t('common.share', 'مشاركة الحدث')}</span>
              </button>

              {/* زر النسخ السريع */}
              <button
                type="button"
                onClick={handleCopyClick}
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isBlackTheme 
                    ? 'bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-200 border border-white/5' 
                    : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700'
                }`}
                title={t('common.copy', 'نسخ')}
                aria-label={t('common.copy', 'نسخ')}
              >
                {copied ? (
                  <Check className="w-6 h-6 text-emerald-400" strokeWidth={2.4} />
                ) : (
                  <Copy className="w-5 h-5" strokeWidth={2} />
                )}
              </button>
            </div>

            {/* زر الإغلاق العريض والواضح */}
            <button
              type="button"
              onClick={onClose}
              className={`w-full h-11 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-colors cursor-pointer ${
                isBlackTheme
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-white/5'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200 active:bg-slate-300'
              }`}
            >
              {t('common.close', 'إغلاق النافذة')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnThisDayBottomSheet;
