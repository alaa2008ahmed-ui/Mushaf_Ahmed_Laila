import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { presetThemes } from '../../context/themes';
import InteractiveBackground from '../InteractiveBackground';

interface InitialOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

export const InitialOnboardingModal: React.FC<InitialOnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { setLanguage } = useLanguage();
  const defaultTheme = presetThemes.default;

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: 'ar' | 'en') => {
    try {
      setLanguage(lang);
      localStorage.setItem('initial_community_onboarding_completed', 'true');
    } catch (e) {}
    onClose();
    onNavigate('home');
  };

  const primaryBrandColor = defaultTheme.palette[0] || '#059669';

  return (
    <div 
      className="fixed inset-0 z-[1400] flex flex-col justify-between items-center overflow-hidden select-none"
      style={{ backgroundColor: defaultTheme.bgColor, color: defaultTheme.textColor, fontFamily: defaultTheme.font }}
      dir="rtl"
    >
      {/* خلفية تفاعلية متحركة مطابقة تماماً للصفحة الرئيسية للثيم الافتراضي */}
      <InteractiveBackground 
        className="absolute inset-0 pointer-events-none z-0" 
        themeOverride={defaultTheme} 
      />

      {/* الرأس: البسملة الشريفة */}
      <div className="w-full pt-8 sm:pt-12 px-6 flex justify-center items-center relative z-10">
        <p className="text-xs sm:text-sm font-amiri font-bold tracking-widest text-emerald-800/80">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
      </div>

      {/* المحتوى الرئيسي المركزي: الشعار البارز والعناوين واختيار اللغة */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-sm sm:max-w-md px-6 flex flex-col items-center text-center relative z-10"
      >
        {/* إطار الشعار البارز لتعزيز الهوية البصرية */}
        <div className="relative mb-6">
          <div 
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1.5 flex items-center justify-center transition-transform duration-300 hover:scale-105"
            style={{ 
              backgroundColor: '#FFFFFF',
              border: '2px solid rgba(5, 150, 105, 0.25)',
              boxShadow: '0 20px 40px -15px rgba(5, 150, 105, 0.2), 0 4px 15px rgba(0, 0, 0, 0.06)'
            }}
          >
            <img 
              src="/app_icon.png" 
              alt="Mushaf Logo" 
              className="w-full h-full object-contain rounded-2xl drop-shadow-md"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
        </div>

        {/* اسم التطبيق بالعربية */}
        <h1 
          className="text-2xl sm:text-3xl font-black font-kufi tracking-tight mb-1.5"
          style={{ color: primaryBrandColor }}
        >
          مصحف أحمد وليلى
        </h1>

        {/* اسم التطبيق بالإنجليزية: Mushaf Ahmed & Laila */}
        <h2 
          className="text-base sm:text-lg font-bold font-sans tracking-wide mb-6 text-gray-600"
        >
          Mushaf Ahmed &amp; Laila
        </h2>

        {/* فاصل زخرفي هادئ */}
        <div className="flex items-center justify-center gap-3 w-48 mb-6">
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
          <span className="w-1.5 h-1.5 rotate-45 bg-emerald-600/40 rounded-[1px]" />
          <span className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent" />
        </div>

        {/* اختيار اللغة */}
        <div className="w-full">
          <p className="text-xs sm:text-sm font-bold mb-4 tracking-tight text-gray-800">
            اختر لغة التطبيق / Choose App Language
          </p>

          <div className="w-full space-y-3.5">
            {/* زر اللغة العربية */}
            <button
              onClick={() => handleSelectLanguage('ar')}
              className="w-full py-4 px-6 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500/50"
              style={{
                boxShadow: '0 8px 20px -6px rgba(5, 150, 105, 0.45)'
              }}
            >
              <span>العربية</span>
            </button>

            {/* زر اللغة الإنجليزية */}
            <button
              onClick={() => handleSelectLanguage('en')}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-base sm:text-lg flex items-center justify-center gap-2 border-2 active:scale-[0.98] transition-all cursor-pointer bg-white hover:bg-emerald-50 text-emerald-700 border-emerald-600 shadow-sm"
              style={{
                boxShadow: '0 4px 12px -2px rgba(5, 150, 105, 0.1)'
              }}
            >
              <span>English</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* أسفل الشاشة: الوقف الخيري وحقوق التصميم والتطوير */}
      <div className="w-full pb-6 sm:pb-8 px-4 flex flex-col items-center justify-center gap-1.5 text-center relative z-10">
        <p className="text-xs sm:text-sm font-extrabold text-gray-800 tracking-wide flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span className="font-extrabold">وقف خيري لوجه الله تعالى</span>
          <span className="opacity-40 font-bold">|</span>
          <span className="font-sans font-extrabold">Charitable Endowment for the Sake of Allah</span>
        </p>
        <p className="text-[11px] sm:text-xs font-semibold text-gray-500 tracking-wider flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
          <span>تصميم وتطوير: علاء أحمد</span>
          <span className="opacity-40">|</span>
          <span className="font-sans">Designed & Developed by Alaa Ahmed</span>
        </p>
      </div>
    </div>
  );
};

export default InitialOnboardingModal;
