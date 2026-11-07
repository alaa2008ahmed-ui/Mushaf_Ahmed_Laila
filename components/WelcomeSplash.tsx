import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage, Language } from '../context/LanguageContext';
import { Preferences } from '@capacitor/preferences';

interface WelcomeSplashProps {
  onSelectLanguage: (lang: Language) => void;
}

export const WelcomeSplash: React.FC<WelcomeSplashProps> = ({ onSelectLanguage }) => {
  const { language } = useLanguage();

  const handleSelect = (lang: Language) => {
    try {
      localStorage.setItem('has_selected_initial_language', 'true');
      localStorage.setItem('home_layout_system', 'modern');
      Preferences.set({ key: 'has_selected_initial_language', value: 'true' }).catch(() => {});
      Preferences.set({ key: 'home_layout_system', value: 'modern' }).catch(() => {});
    } catch (e) {}
    onSelectLanguage(lang);
  };

  return (
    <div
      id="app-welcome-splash"
      className="fixed inset-0 z-[9998] flex flex-col justify-between items-center px-4 sm:px-6 py-5 sm:py-8 select-none overflow-y-auto overflow-x-hidden"
      style={{
        paddingTop: 'max(1.25rem, env(safe-area-inset-top, 1.25rem))',
        paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left, 1rem))',
        paddingRight: 'max(1rem, env(safe-area-inset-right, 1rem))',
        background: 'radial-gradient(ellipse at 50% 35%, #FFFFFF 0%, #FFFDF5 45%, #FEF9EB 80%, #FDF3DA 100%)',
        transform: 'translateZ(0)',
        WebkitBackfaceVisibility: 'hidden',
        backfaceVisibility: 'hidden',
      }}
      dir="rtl"
    >
      {/* 1. Top Basmalah - Enlarged & Prominent */}
      <div className="relative z-10 pt-1 sm:pt-3 text-center w-full">
        <h1
          className="text-[#78350F] font-black text-xl sm:text-2xl md:text-3xl lg:text-4xl tracking-wider select-none whitespace-nowrap px-2"
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', 'Cairo', serif",
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 2px 4px rgba(180, 83, 9, 0.15)'
          }}
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </h1>
      </div>

      {/* 2. Center Content - Generously Sized to Fill the Page */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-md sm:max-w-lg px-2 py-4">
        {/* App Icon in Large Crisp 3D Card with Tactile Depth */}
        <div
          className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 bg-white rounded-[2rem] sm:rounded-[2.5rem] p-3 sm:p-4 flex items-center justify-center overflow-hidden transition-transform duration-300 hover:scale-105"
          style={{
            border: '2px solid rgba(217, 119, 6, 0.28)',
            boxShadow: '0 10px 0 rgba(180, 83, 9, 0.14), 0 20px 35px -6px rgba(120, 53, 15, 0.22), inset 0 2.5px 3px rgba(255, 255, 255, 0.98), inset 0 -3px 5px rgba(217, 119, 6, 0.1)'
          }}
        >
          {/* 3D Glossy specular sheen */}
          <div className="absolute inset-x-2 top-0.5 h-[40%] rounded-t-[1.75rem] sm:rounded-t-[2.25rem] bg-gradient-to-b from-white/60 via-white/15 to-transparent pointer-events-none" />
          <div className="absolute inset-x-8 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
          <div className="absolute inset-x-6 bottom-0 h-[3px] bg-amber-900/12 rounded-b-[1.75rem] sm:rounded-b-[2.25rem] pointer-events-none" />

          {/* Subtle inner highlight border matching the golden theme */}
          <div className="absolute inset-2 rounded-[1.5rem] sm:rounded-[2rem] border border-amber-400/40 shadow-[0_0_15px_rgba(245,158,11,0.22)] pointer-events-none" />
          <img
            src="/app_icon.png"
            alt="مصحف أحمد و ليلى"
            loading="eager"
            decoding="sync"
            draggable={false}
            className="w-full h-full object-contain rounded-2xl drop-shadow-md select-none pointer-events-none"
          />
        </div>

        {/* App Title & Subtitle - Larger & Bolder */}
        <div className="text-center mt-4 sm:mt-5">
          <h2
            className="text-2xl sm:text-3xl md:text-4xl font-black text-[#78350F] tracking-tight leading-snug select-none whitespace-nowrap"
            style={{
              fontFamily: "'Cairo', sans-serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 2px 0 rgba(217, 119, 6, 0.25), 0 3px 6px rgba(0, 0, 0, 0.12)'
            }}
          >
            مصحف أحمد و ليلى
          </h2>
          <p
            className="text-sm sm:text-base md:text-lg font-extrabold text-[#92400E] mt-1 tracking-tight select-none"
            style={{
              fontFamily: "'Cairo', 'Inter', sans-serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1px 2px rgba(180, 83, 9, 0.15)'
            }}
          >
            Mushaf Ahmed & Laila
          </p>
        </div>

        {/* Decorative Divider with Central Diamond Accent */}
        <div className="my-3 sm:my-4 w-44 sm:w-56 flex items-center justify-center gap-2.5">
          <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-amber-400 to-amber-600" />
          <div className="w-2.5 h-2.5 rotate-45 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 rounded-[2px] shadow-sm border border-amber-200/90" />
          <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-amber-400 to-amber-600" />
        </div>

        {/* Language Prompt Label */}
        <div
          dir="ltr"
          className="flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-black text-[#78350F] text-center tracking-normal mb-3 sm:mb-4 select-none"
          style={{
            fontFamily: "'Cairo', sans-serif",
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(180, 83, 9, 0.12)'
          }}
        >
          <span className="font-sans">Choose App Language</span>
          <span className="text-amber-500 font-bold">/</span>
          <span>اختر لغة التطبيق</span>
        </div>

        {/* Action Buttons - Enlarged, Full-Width Touch Targets */}
        <div className="w-full max-w-[300px] sm:max-w-xs md:max-w-sm flex flex-col gap-3 mx-auto">
          {/* Arabic Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => handleSelect('ar')}
            className="w-full h-12 sm:h-14 relative overflow-hidden rounded-2xl font-black text-base sm:text-lg md:text-xl text-white flex items-center justify-center cursor-pointer select-none group focus:outline-none"
            style={{
              fontFamily: "'Cairo', sans-serif",
              background: 'linear-gradient(155deg, #FBBF24 0%, #F59E0B 35%, #D97706 70%, #B45309 100%)',
              border: '2px solid rgba(254, 243, 199, 0.9)',
              boxShadow: '0 4.5px 0 #78350F, 0 10px 22px -3px rgba(180, 83, 9, 0.4), inset 0 2px 2px rgba(255, 255, 255, 0.9), inset 0 -2px 4px rgba(0, 0, 0, 0.25)',
              color: '#FFFFFF',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 1px rgba(120, 53, 15, 0.9)',
            }}
          >
            {/* 3D Glossy specular sheen */}
            <div className="absolute inset-x-2 top-0.5 h-[48%] rounded-t-xl bg-gradient-to-b from-white/50 via-white/18 to-transparent pointer-events-none" />
            <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
            <div className="absolute inset-x-3 bottom-0 h-[2.5px] bg-black/25 rounded-b-2xl pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <span className="relative z-10 drop-shadow-sm tracking-wide">العربية</span>
          </motion.button>

          {/* English Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97, y: 2 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            onClick={() => handleSelect('en')}
            className="w-full h-12 sm:h-14 relative overflow-hidden rounded-2xl font-black text-base sm:text-lg md:text-xl flex items-center justify-center cursor-pointer select-none group focus:outline-none"
            style={{
              fontFamily: "'Cairo', 'Inter', sans-serif",
              background: 'linear-gradient(160deg, #FFFFFF 0%, #FFFDF5 55%, #FEF3C7 100%)',
              border: '2.5px solid #D97706',
              boxShadow: '0 4.5px 0 #92400E, 0 10px 22px -3px rgba(180, 83, 9, 0.18), inset 0 2px 2px rgba(255, 255, 255, 0.98), inset 0 -2px 4px rgba(217, 119, 6, 0.14)',
              color: '#78350F',
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1px 2px rgba(217, 119, 6, 0.22)',
            }}
          >
            {/* 3D Glossy specular sheen */}
            <div className="absolute inset-x-2 top-0.5 h-[48%] rounded-t-xl bg-gradient-to-b from-white/70 via-white/25 to-transparent pointer-events-none" />
            <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
            <div className="absolute inset-x-3 bottom-0 h-[2.5px] bg-amber-900/12 rounded-b-2xl pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

            <span className="relative z-10 drop-shadow-xs tracking-wide">English</span>
          </motion.button>
        </div>
      </div>

      {/* 3. Bottom Section - Endowment & Credits Formatted for Full Viewport Presence */}
      <div className="relative z-10 pb-1 sm:pb-2 text-center flex flex-col items-center select-none w-full max-w-md">
        <p
          className="text-base sm:text-lg md:text-xl font-black text-[#78350F] leading-snug"
          style={{
            fontFamily: "'Cairo', sans-serif",
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1px 2px rgba(217, 119, 6, 0.18)'
          }}
        >
          وقف خيري لوجه الله تعالى
        </p>
        <p
          className="text-xs sm:text-sm md:text-base font-extrabold text-[#92400E] mt-0.5 leading-snug"
          style={{
            fontFamily: "'Inter', sans-serif",
            textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)'
          }}
        >
          Charitable Endowment for the Sake of Allah
        </p>

        {/* Credits */}
        <div className="mt-2 sm:mt-2.5 flex flex-col items-center">
          <p
            className="text-xs sm:text-sm md:text-base text-[#B45309] font-black"
            style={{
              fontFamily: "'Cairo', sans-serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            تصميم وتطوير: علاء أحمد المرشدى
          </p>
          <p
            className="text-[11px] sm:text-xs md:text-sm text-[#D97706] mt-0.5 font-bold"
            style={{
              fontFamily: "'Inter', sans-serif",
              textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)'
            }}
          >
            Designed & Developed by Alaa Ahmed Elmorshedy
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeSplash;
