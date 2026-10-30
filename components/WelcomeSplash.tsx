import React from 'react';
import { motion } from 'framer-motion';
import InteractiveBackground from './InteractiveBackground';
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

  const goldenParticlesTheme: any = {
    name: 'golden_splash',
    bgColor: '#F8FAFC',
    textColor: '#78350F',
    font: "'Cairo', sans-serif",
    palette: ['#F59E0B', '#D97706', '#B45309', '#78350F']
  };

  return (
    <motion.div
      key="welcome-splash"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999] bg-[#F8FAFC] flex flex-col justify-between items-center px-4 py-6 sm:py-8 select-none overflow-hidden"
      dir="rtl"
    >
          {/* Interactive Particle Background with golden palette matching Modern Design */}
          <InteractiveBackground themeOverride={goldenParticlesTheme} className="fixed inset-0 z-0 pointer-events-none opacity-60" />

          {/* Ambient Accent Bokeh Circles (Matching Home Page & Modern Golden Design) */}
          <div className="absolute top-12 left-10 w-3 h-3 rounded-full bg-[#1E293B]/70 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-20 right-14 w-4 h-4 rounded-full bg-[#1E293B]/60 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-36 left-8 w-3.5 h-3.5 rounded-full bg-[#A855F7]/80 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-44 left-24 w-2 h-2 rounded-full bg-[#F59E0B]/70 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-28 left-1/3 w-2.5 h-2.5 rounded-full bg-[#D97706]/70 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-52 right-1/4 w-3 h-3 rounded-full bg-[#A855F7]/60 blur-[0.5px] pointer-events-none" />
          <div className="absolute top-64 right-10 w-2.5 h-2.5 rounded-full bg-[#F59E0B]/60 blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-40 left-6 w-3 h-3 rounded-full bg-[#A855F7]/80 blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-28 left-8 w-3.5 h-3.5 rounded-full bg-[#1E293B]/60 blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-32 right-10 w-3 h-3 rounded-full bg-[#F59E0B]/70 blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-24 right-20 w-2.5 h-2.5 rounded-full bg-[#D97706]/60 blur-[0.5px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/3 w-2.5 h-2.5 rounded-full bg-[#A855F7]/70 blur-[0.5px] pointer-events-none" />

          {/* Top Basmalah */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="relative z-10 pt-2 text-center"
          >
            <h1
              className="text-[#78350F] font-black text-xl sm:text-2xl tracking-wide select-none"
              style={{
                fontFamily: "'Cairo', 'Amiri', 'Amiri Quran', serif",
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 2px 0 rgba(217, 119, 6, 0.25), 0 3px 4px rgba(0, 0, 0, 0.12)'
              }}
            >
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </h1>
          </motion.div>

          {/* Center Brand and Language Picker */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto w-full max-w-sm px-2">
            {/* App Icon in Crisp 3D Card with Tactile Depth */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.5, type: 'spring' }}
              className="relative w-44 h-44 sm:w-52 sm:h-52 bg-white rounded-[2.25rem] sm:rounded-[2.75rem] p-3 flex items-center justify-center overflow-hidden"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.95)',
                boxShadow: '0 8px 0 rgba(0, 0, 0, 0.08), 0 16px 32px -4px rgba(0, 0, 0, 0.14), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2.5px 4px rgba(0, 0, 0, 0.04)'
              }}
            >
              {/* 3D Glossy specular sheen */}
              <div className="absolute inset-x-2 top-0.5 h-[38%] rounded-t-[2rem] sm:rounded-t-[2.5rem] bg-gradient-to-b from-white/40 via-white/10 to-transparent pointer-events-none" />
              <div className="absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
              <div className="absolute inset-x-6 bottom-0 h-[2.5px] bg-black/8 rounded-b-[2.25rem] sm:rounded-b-[2.75rem] pointer-events-none" />

              {/* Subtle inner highlight border matching the golden theme */}
              <div className="absolute inset-1.5 rounded-[1.85rem] sm:rounded-[2.35rem] border border-amber-400/35 shadow-[0_0_12px_rgba(245,158,11,0.2)] pointer-events-none" />
              <img
                src="/app_icon.png"
                alt="مصحف أحمد و ليلى"
                className="w-full h-full object-contain rounded-2xl drop-shadow-sm select-none pointer-events-none"
              />
            </motion.div>

            {/* App Title & Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="text-center mt-5"
            >
              <h2
                className="text-3xl sm:text-4xl font-black text-[#78350F] tracking-tight leading-snug select-none"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 2px 0 rgba(217, 119, 6, 0.3), 0 3px 3px rgba(0, 0, 0, 0.12), 0 5px 8px rgba(180, 83, 9, 0.15)'
                }}
              >
                مصحف أحمد و ليلى
              </h2>
              <p
                className="text-base sm:text-lg font-black text-slate-800 mt-0.5 tracking-tight select-none"
                style={{
                  fontFamily: "'Cairo', 'Inter', sans-serif",
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1.5px 2px rgba(0, 0, 0, 0.15)'
                }}
              >
                Mushaf Ahmed & Laila
              </p>
            </motion.div>

            {/* Decorative Divider with Central Diamond Accent */}
            <motion.div
              initial={{ opacity: 0, scaleX: 0.8 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="my-3 sm:my-4 w-44 sm:w-56 flex items-center justify-center gap-2"
            >
              <div className="h-[1.5px] flex-1 bg-gradient-to-r from-transparent via-amber-300 to-amber-500" />
              <div className="w-2.5 h-2.5 rotate-45 bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 rounded-[1px] shadow-sm border border-amber-200/90" />
              <div className="h-[1.5px] flex-1 bg-gradient-to-l from-transparent via-amber-300 to-amber-500" />
            </motion.div>

            {/* Language Prompt Label */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              dir="ltr"
              className="flex items-center justify-center gap-2 text-xs sm:text-sm font-black text-slate-800 text-center tracking-normal mb-3.5 select-none"
              style={{
                fontFamily: "'Cairo', sans-serif",
                textShadow: '0 1px 0 rgba(255, 255, 255, 0.9), 0 1.5px 2px rgba(0, 0, 0, 0.12)'
              }}
            >
              <span className="font-sans">Choose App Language</span>
              <span className="text-slate-400 font-bold">/</span>
              <span>اختر لغة التطبيق</span>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full flex flex-col gap-3.5"
            >
              {/* Arabic Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 3.5 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleSelect('ar')}
                className="w-full h-14 relative overflow-hidden rounded-2xl font-black text-xl text-white flex items-center justify-center cursor-pointer select-none group focus:outline-none"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  background: 'linear-gradient(155deg, #F59E0B 0%, #D97706 40%, #B45309 80%, #92400E 100%)',
                  border: '1.5px solid rgba(254, 243, 199, 0.7)',
                  boxShadow: '0 6px 0 #78350F, 0 14px 28px -2px rgba(180, 83, 9, 0.45), inset 0 2px 2px rgba(255, 255, 255, 0.7), inset 0 -2px 4px rgba(0, 0, 0, 0.25)',
                  color: '#FFFFFF',
                  textShadow: '0 1.5px 3px rgba(0, 0, 0, 0.45), 0 1px 1px rgba(120, 53, 15, 0.8)',
                }}
              >
                {/* 3D Glossy specular sheen */}
                <div className="absolute inset-x-2 top-0.5 h-[48%] rounded-t-[14px] bg-gradient-to-b from-white/40 via-white/15 to-transparent pointer-events-none" />
                <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
                <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/20 rounded-b-2xl pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <span className="relative z-10 drop-shadow-sm">العربية</span>
              </motion.button>

              {/* English Button */}
              <motion.button
                type="button"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98, y: 3.5 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
                onClick={() => handleSelect('en')}
                className="w-full h-14 relative overflow-hidden rounded-2xl font-black text-xl flex items-center justify-center cursor-pointer select-none group focus:outline-none"
                style={{
                  fontFamily: "'Cairo', 'Inter', sans-serif",
                  background: 'linear-gradient(160deg, #FFFFFF 0%, #FFFDF9 60%, #FEF8E8 100%)',
                  border: '2px solid #D97706',
                  boxShadow: '0 6px 0 #92400E, 0 14px 28px -2px rgba(180, 83, 9, 0.18), inset 0 2px 2px rgba(255, 255, 255, 0.95), inset 0 -2px 4px rgba(217, 119, 6, 0.12)',
                  color: '#78350F',
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1.5px 2px rgba(217, 119, 6, 0.25)',
                }}
              >
                {/* 3D Glossy specular sheen */}
                <div className="absolute inset-x-2 top-0.5 h-[48%] rounded-t-[14px] bg-gradient-to-b from-white/60 via-white/20 to-transparent pointer-events-none" />
                <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/95 to-transparent rounded-full pointer-events-none" />
                <div className="absolute inset-x-4 bottom-0 h-[2px] bg-amber-900/10 rounded-b-2xl pointer-events-none" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-amber-100/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <span className="relative z-10 drop-shadow-xs">English</span>
              </motion.button>
            </motion.div>

            {/* Endowment & Credits directly below English button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.5 }}
              className="mt-5 text-center flex flex-col items-center select-none w-full"
            >
              {/* النص باللغة العربية أولاً أسفل زر English تماماً */}
              <p
                className="text-sm sm:text-base font-black text-slate-800 leading-snug"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.95), 0 1.5px 2px rgba(0, 0, 0, 0.14)'
                }}
              >
                وقف خيري لوجه الله تعالى
              </p>
              {/* ثم النص باللغة الإنجليزية أسفله */}
              <p
                className="text-xs sm:text-sm font-bold text-slate-600 mt-1 leading-snug"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  textShadow: '0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 2px rgba(0, 0, 0, 0.1)'
                }}
              >
                Charitable Endowment for the Sake of Allah
              </p>

              {/* حقوق التصميم والتطوير */}
              <div className="mt-3 flex flex-col items-center">
                <p
                  className="text-xs text-slate-600 font-bold"
                  style={{
                    fontFamily: "'Cairo', sans-serif",
                    textShadow: '0 1px 0 rgba(255, 255, 255, 0.9), 0 1px 1px rgba(0, 0, 0, 0.08)'
                  }}
                >
                  تصميم وتطوير: علاء أحمد
                </p>
                <p
                  className="text-[11px] text-slate-500 mt-0.5 font-semibold"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    textShadow: '0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Designed & Developed by Alaa Ahmed
                </p>
              </div>
            </motion.div>
          </div>
        </motion.div>
  );
};

export default WelcomeSplash;
