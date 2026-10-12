import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, X, RotateCcw, Image, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { presetThemes } from '../../context/themes';

interface ThemesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ألوان الدوائر المميزة لكل ثيم من ثيمات الصفحة الرئيسية
const getThemeCircleColor = (key: string, t: any) => {
  if (key === 'deep_black') return '#000000';
  if (key === 'default') return '#059669';
  if (key === 'fajr_light') return '#0284C7';
  if (key === 'golden_sand') return '#B45309';
  if (key === 'olive_grove') return '#4D7C0F';
  if (key === 'kaaba_kiswa') return '#111827';
  if (key === 'islamic_heritage') return '#8B4513';
  if (key === 'evening_tranquility') return '#2563EB';
  if (key === 'morning_dew') return '#10B981';
  if (key === 'madinah_rose') return '#BE123C';
  if (key === 'andalusian_garden') return '#166534';
  if (key === 'blue_mosque') return '#0E7490';
  if (key === 'clay_earth') return '#9A3412';
  if (key === 'slate_stone') return '#334155';
  if (key === 'sunset_glow') return '#EA580C';
  if (key === 'electric_violet') return '#7C3AED';
  if (key === 'sakura_breeze') return '#DB2777';
  if (key === 'midnight_neon') return '#0891B2';
  if (key === 'royal_purple') return '#6D28D9';
  if (key === 'desert_night') return '#4338CA';
  if (key === 'ocean_peace') return '#0284C7';
  if (key === 'vintage_paper') return '#78350F';
  if (key === 'turquoise_gem') return '#0D9488';
  if (key === 'deep_forest') return '#047857';
  if (key === 'lavender_mist') return '#A855F7';
  if (key === 'crystal_glass') return '#38BDF8';
  if (key === 'frosted_emerald') return '#059669';
  if (key === 'midnight_glass') return '#1E1B4B';
  return t.palette?.[0] || t.accent || t.bgColor || '#10B981';
};

export const ThemesSidebar: React.FC<ThemesSidebarProps> = ({ isOpen, onClose }) => {
  const { theme, themeKey, applyPresetTheme, setCustomBackground, resetBackground } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBgUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const isVideo = file.type.startsWith('video/');
        setCustomBackground(result, isVideo);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1200] bg-black/45 backdrop-blur-[2px]"
          />

          {/* Narrow Full-Height Sidebar Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="fixed top-[env(safe-area-inset-top,20px)] bottom-0 right-0 z-[1250] h-[calc(100%-env(safe-area-inset-top,20px))] w-[30vw] max-w-[85vw] shadow-2xl flex flex-col border-l overflow-hidden"
            dir="rtl"
            style={{
              backgroundColor: theme.cardBg || (theme.bgColor === '#000000' ? '#09090b' : '#ffffff'),
              color: theme.textColor || '#000000',
              borderColor: (theme.palette?.[0] || '#10b981') + '40',
              fontFamily: theme.font
            }}
          >
            {/* Header */}
            <div 
              className="p-3 border-b flex items-center justify-between shrink-0"
              style={{ borderColor: (theme.palette?.[0] || '#10b981') + '25' }}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                <Palette className="w-4 h-4 text-amber-500" />
                <span className="font-kufi">ثيمات التطبيق</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions Row */}
            <div 
              className="p-2 border-b grid grid-cols-3 gap-1 shrink-0 bg-black/5 dark:bg-white/5"
              style={{ borderColor: (theme.palette?.[0] || '#10b981') + '20' }}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="py-1 px-1.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/10"
                title="تخصيص خلفية مخصصة"
              >
                <Image className="w-3.5 h-3.5 text-blue-500" />
                <span>خلفية</span>
              </button>

              <button
                type="button"
                onClick={() => resetBackground()}
                className="py-1 px-1.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/10"
                title="استعادة الخلفية"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>استعادة</span>
              </button>

              <button
                type="button"
                onClick={() => applyPresetTheme('default')}
                className="py-1 px-1.5 rounded-lg text-[9px] font-bold flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 hover:bg-black/5 dark:hover:bg-white/10"
                title="الثيم الافتراضي"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>الافتراضي</span>
              </button>
            </div>

            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*,video/*" 
              className="hidden" 
              onChange={handleBgUpload} 
            />

            {/* Scrollable Theme Circles (فقط ثيمات الصفحة الرئيسية) */}
            <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
              <div className="grid grid-cols-2 gap-y-4 gap-x-2 pb-4">
                {Object.entries(presetThemes).map(([key, t]: [string, any]) => {
                  const isSelected = themeKey === key;
                  const circleBg = getThemeCircleColor(key, t);

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPresetTheme(key)}
                      className="flex flex-col items-center gap-1.5 group transition-transform active:scale-90"
                      title={t.name}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center relative shadow-sm ${
                          isSelected
                            ? 'scale-110 border-white shadow-md ring-2 ring-emerald-500 ring-offset-1'
                            : 'border-black/15 dark:border-white/20 hover:scale-105'
                        }`}
                        style={{ backgroundColor: circleBg }}
                      >
                        {isSelected && (
                          <div
                            className={`w-1.5 h-1.5 rounded-full shadow-sm ${
                              key === 'deep_black' || key === 'kaaba_kiswa' ? 'bg-emerald-500' : 'bg-white'
                            }`}
                          />
                        )}
                      </div>
                      <span
                        className="text-[7px] font-bold opacity-85 truncate w-full text-center leading-tight"
                        style={{ color: theme.textColor }}
                      >
                        {t.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default ThemesSidebar;
