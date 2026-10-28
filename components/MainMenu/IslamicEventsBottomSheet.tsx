import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Moon, 
  Share2, 
  Copy, 
  Check, 
  ChevronLeft, 
  ChevronRight,
  Calendar
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

interface IslamicEventsBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  events: IslamicEventItem[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  onShare: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
}

export const IslamicEventsBottomSheet: React.FC<IslamicEventsBottomSheetProps> = ({
  isOpen,
  onClose,
  events,
  currentIndex,
  onSelectIndex,
  onShare,
  onCopy,
}) => {
  const { language, isRTL, dir, t, translateEventName, formatNumber } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const currentEvent = events[currentIndex] || events[0];

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy(e);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex - 1 + events.length) % events.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectIndex((currentIndex + 1) % events.length);
  };

  if (!isOpen || !currentEvent) return null;

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
          className={`w-full max-w-lg mx-auto rounded-t-[28px] shadow-2xl flex flex-col max-h-[88vh] overflow-hidden relative ${
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
                  <Moon className="w-5 h-5" strokeWidth={2.4} />
                </div>
                <div className="flex flex-col">
                  <h3 className={`text-base sm:text-lg font-bold font-kufi leading-tight ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                    {t('islamic_events.modal_title', 'المناسبات الإسلامية')}
                  </h3>
                  <span className={`text-xs font-medium ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                    {language === 'en' ? 'Upcoming blessed occasions' : 'المناسبات والشهور المباركة'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Scrollable Body Content */}
          <div className="overflow-y-auto px-6 py-4 flex flex-col gap-5 flex-1 overscroll-contain">
            
            {/* أزرار التنقل بين المناسبات بخط كبير وواضح */}
            <div className={`flex items-center justify-between p-2 rounded-2xl ${
              isBlackTheme ? 'bg-zinc-800/80 border border-zinc-700/60' : 'bg-slate-50 border border-slate-100'
            }`}>
              <button
                type="button"
                onClick={handlePrev}
                className={`py-2 px-3 rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isBlackTheme ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
                aria-label={t('islamic_events.prev', 'المناسبة السابقة')}
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                <span>{t('islamic_events.prev', 'السابقة')}</span>
              </button>

              <span className={`text-xs sm:text-sm font-bold font-sans ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                {formatNumber(currentIndex + 1)} / {formatNumber(events.length)}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className={`py-2 px-3 rounded-xl shadow-xs active:scale-95 flex items-center gap-1.5 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  isBlackTheme ? 'bg-zinc-700 hover:bg-zinc-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-700'
                }`}
                aria-label={t('islamic_events.next', 'المناسبة التالية')}
              >
                <span>{t('islamic_events.next', 'التالية')}</span>
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* اسم المناسبة بخط عملاق جداً مخصص لضعاف البصر وكبار السن */}
            <div className="text-center px-2">
              <h2 className={`text-2xl sm:text-3xl font-black font-kufi leading-snug ${isBlackTheme ? 'text-white' : 'text-slate-900'}`}>
                {translateEventName(currentEvent.name)}
              </h2>
            </div>

            {/* بطاقة عداد الأيام الكبيرة (Light Mint Card) مريحة جداً للعين وبارزة */}
            <div 
              className="w-full rounded-2xl p-5 sm:p-6 text-center flex flex-col items-center justify-center transition-all shadow-xs"
              style={{
                backgroundColor: isBlackTheme ? '#064e3b' : '#ECFDF5',
                border: isBlackTheme ? '1.5px solid #059669' : '1.5px solid #A7F3D0',
              }}
            >
              <span className={`text-base sm:text-lg font-bold tracking-wide font-kufi ${isBlackTheme ? 'text-emerald-200' : 'text-emerald-800'}`}>
                {currentEvent.isToday 
                  ? t('islamic_events.matches', 'توافق اليوم المبارك')
                  : (currentEvent.daysRemaining > 0 
                      ? t('islamic_events.remaining_on', 'يتبقى عليها بإذن الله') 
                      : t('islamic_events.passed_on', 'مر عليها'))}
              </span>

              <div className="flex items-baseline justify-center gap-2 my-2">
                <span className={`text-5xl sm:text-6xl font-black font-kufi tracking-tight leading-none drop-shadow-xs ${isBlackTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  {currentEvent.isToday ? t('islamic_events.today', 'اليوم') : formatNumber(Math.abs(currentEvent.daysRemaining))}
                </span>
                {!currentEvent.isToday && (
                  <span className={`text-xl sm:text-2xl font-black font-kufi ${isBlackTheme ? 'text-emerald-200' : 'text-emerald-800'}`}>
                    {t('islamic_events.days', 'يوم')}
                  </span>
                )}
              </div>

              <span className={`text-xs sm:text-sm font-semibold mt-1 ${isBlackTheme ? 'text-emerald-300/80' : 'text-emerald-700/80'}`}>
                {currentEvent.daysRemaining > 0
                  ? (language === 'en' ? 'Mark your calendar & prepare good deeds' : 'فرصة لاغتنام الطاعات والتقرب إلى الله')
                  : (language === 'en' ? 'Past occasion' : 'تقبل الله منا ومنكم صالح الأعمال')}
              </span>
            </div>

            {/* شريط التواريخ الهجرية والميلادية بخط كبير وواضح */}
            <div className={`flex flex-col gap-2.5 p-4 rounded-2xl ${
              isBlackTheme ? 'bg-zinc-800/80 border border-zinc-700/60' : 'bg-slate-50 border border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <span className={`text-sm font-bold font-kufi ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {language === 'en' ? 'Hijri Date:' : 'التاريخ الهجري:'}
                  </span>
                </div>
                <span className={`text-base sm:text-lg font-black font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                  {currentEvent.dateStr}
                </span>
              </div>

              <div className={`h-[1px] w-full ${isBlackTheme ? 'bg-zinc-700/60' : 'bg-slate-200/60'}`} />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${isBlackTheme ? 'text-zinc-500' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold font-kufi ${isBlackTheme ? 'text-zinc-400' : 'text-slate-500'}`}>
                    {language === 'en' ? 'Gregorian Date:' : 'التاريخ الميلادي:'}
                  </span>
                </div>
                <span className={`text-base sm:text-lg font-black ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
                  {currentEvent.gregorianDateStr}
                </span>
              </div>
            </div>

            {/* قائمة سريعة بالمناسبات القادمة لسهولة التصفح */}
            <div className="flex flex-col gap-2 mt-1">
              <span className={`text-xs font-bold font-kufi ${isBlackTheme ? 'text-zinc-400' : 'text-slate-400'}`}>
                {language === 'en' ? 'All Occasions Overview' : 'نظرة سريعة على جميع المناسبات'}
              </span>
              <div className="flex flex-col gap-2">
                {events.map((ev, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between text-start transition-all cursor-pointer ${
                      idx === currentIndex 
                        ? (isBlackTheme 
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200 font-bold shadow-xs' 
                            : 'bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold shadow-xs')
                        : (isBlackTheme 
                            ? 'bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/60 text-zinc-300' 
                            : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-700')
                    }`}
                  >
                    <span className="text-sm sm:text-base font-bold font-kufi">
                      {translateEventName(ev.name)}
                    </span>
                    <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${
                      idx === currentIndex 
                        ? 'bg-emerald-600 text-white' 
                        : (isBlackTheme ? 'bg-zinc-700 text-zinc-300' : 'bg-slate-100 text-slate-600')
                    }`}>
                      {ev.isToday 
                        ? t('islamic_events.today', 'اليوم') 
                        : (ev.daysRemaining > 0 
                            ? `${formatNumber(ev.daysRemaining)} ${t('islamic_events.days', 'يوم')}`
                            : `${t('islamic_events.passed_on', 'مرت')}`)}
                    </span>
                  </button>
                ))}
              </div>
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
              {/* زر المشاركة الرئيسي العريض */}
              <button
                type="button"
                onClick={onShare}
                className="flex-1 h-13 sm:h-14 rounded-2xl font-bold text-base sm:text-lg text-white flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg active:scale-98 transition-all cursor-pointer"
                style={{
                  backgroundColor: primaryColor,
                }}
              >
                <Share2 className="w-5 h-5" />
                <span>{t('common.share', 'مشاركة المناسبة')}</span>
              </button>

              {/* زر النسخ */}
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

export default IslamicEventsBottomSheet;
