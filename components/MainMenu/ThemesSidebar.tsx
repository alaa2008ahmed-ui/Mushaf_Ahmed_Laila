import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { presetThemes } from '../../context/themes';

interface ThemesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// ألوان الدوائر المميزة لكل ثيم من ثيمات الصفحة الرئيسية
const getThemeCircleColor = (key: string, t: any) => {
  if (key === 'deep_black') return '#000000';
  if (key === 'shiny_gold') return '#EAB308';
  if (key === 'default') return '#059669';
  if (key === 'fajr_light') return '#0284C7';
  if (key === 'golden_sand') return '#B45309';
  if (key === 'olive_grove') return '#4D7C0F';
  if (key === 'kaaba_kiswa') return '#111827';
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
  return (t?.palette && t.palette[0]) || t?.accent || t?.bgColor || '#10B981';
};

// Helper: Calculate relative perceived luminance of a hex color (0 = black, 1 = white)
const getLuminance = (hexColor: string): number => {
  if (!hexColor || typeof hexColor !== 'string') return 0.5;
  const hex = hexColor.replace('#', '').trim();
  if (hex.length !== 6 && hex.length !== 3) return 0.5;
  const fullHex = hex.length === 3 
    ? hex.split('').map(c => c + c).join('') 
    : hex;
  const r = parseInt(fullHex.substring(0, 2), 16);
  const g = parseInt(fullHex.substring(2, 4), 16);
  const b = parseInt(fullHex.substring(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return 0.5;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
};

export const ThemesSidebar: React.FC<ThemesSidebarProps> = ({ isOpen, onClose }) => {
  const { theme, themeKey, applyPresetTheme } = useTheme();
  const { isRTL } = useLanguage();
  const asideRef = useRef<HTMLElement>(null);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const sidebarBg = isBlackTheme ? '#000000' : (theme.bgColor || '#DFE5EC');
  const sidebarLum = getLuminance(sidebarBg);
  const isDarkBg = isBlackTheme || sidebarLum < 0.45;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Transparent clickaway backdrop without any dimming/tint */}
          <div
            onClick={onClose}
            className="fixed inset-0 z-[1200] bg-transparent cursor-pointer"
            style={{ position: 'fixed' }}
          />

          {/* Narrow Sidebar Drawer: stuck to right in RTL, and left in LTR/English */}
          <motion.aside
            ref={asideRef}
            initial={{ x: isRTL ? '100%' : '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRTL ? '100%' : '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className={`w-[88px] sm:w-[98px] shadow-2xl flex flex-col ${
              isRTL 
                ? 'rounded-l-2xl rounded-r-none' 
                : 'rounded-r-2xl rounded-l-none'
            } overflow-hidden`}
            dir={isRTL ? "rtl" : "ltr"}
            style={{
              position: 'fixed',
              top: 'calc(env(safe-area-inset-top, 0px) + 1cm)',
              bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1cm)',
              right: isRTL ? 0 : 'auto',
              left: isRTL ? 'auto' : 0,
              zIndex: 1250,
              backgroundColor: sidebarBg,
              color: isDarkBg ? '#FFFFFF' : theme.textColor,
              border: 'none',
              borderLeft: isRTL ? (isDarkBg ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.08)') : 'none',
              borderRight: !isRTL ? (isDarkBg ? '1px solid rgba(255, 255, 255, 0.18)' : '1px solid rgba(0, 0, 0, 0.08)') : 'none',
              fontFamily: theme.font,
            }}
          >
            {/* Quick Actions Row: Standalone 3D Embossed Icons (No Button Boxes) */}
            {/* Scrollable Theme Circles */}
            <div className="flex-1 overflow-y-auto px-2 pt-3 pb-3 scrollbar-hide relative z-10" style={{ backgroundColor: 'transparent' }}>
              <div 
                className="grid grid-cols-2 gap-y-[10.7px] gap-x-2 place-items-center pt-0.5 pb-2"
                style={{ rowGap: '10.7px' }}
              >
                {Object.entries(presetThemes).map(([key, t]: [string, any]) => {
                  const isSelected = themeKey === key;
                  const baseCircleColor = getThemeCircleColor(key, t);
                  const circleLum = getLuminance(baseCircleColor);
                  const isDarkCircle = circleLum < 0.35 || key === 'deep_black' || key === 'kaaba_kiswa';
                  
                  // For deep_black on dark/black background, use a sleek charcoal tone so the inside of the circle is distinct
                  const circleBg = (key === 'deep_black' && isDarkBg) ? '#18181B' : baseCircleColor;

                  // High-contrast border and shadows dynamically adapted to sidebar background and circle luminance
                  let circleBorder: string;
                  let circleShadow: string;

                  if (isDarkBg) {
                    if (isDarkCircle) {
                      // Dark circles on dark background: crisp white border + contrast glow
                      circleBorder = '2px solid rgba(255, 255, 255, 0.85)';
                      circleShadow = isSelected
                        ? '0 0 0 2.5px #10B981, 0 0 10px rgba(16, 185, 129, 0.7)'
                        : '0 0 0 1px rgba(255, 255, 255, 0.3), 0 2px 6px rgba(0, 0, 0, 0.6)';
                    } else {
                      // Light / vibrant circles on dark background
                      circleBorder = '1.5px solid rgba(255, 255, 255, 0.45)';
                      circleShadow = isSelected
                        ? '0 0 0 2.5px #FFFFFF, 0 0 10px rgba(255, 255, 255, 0.6)'
                        : '0 2px 6px rgba(0, 0, 0, 0.4)';
                    }
                  } else {
                    if (circleLum > 0.75) {
                      // Very light circles on light background: crisp dark border
                      circleBorder = '2px solid rgba(0, 0, 0, 0.35)';
                      circleShadow = isSelected
                        ? '0 0 0 2.5px #059669, 0 3px 8px rgba(0, 0, 0, 0.25)'
                        : '0 1px 4px rgba(0, 0, 0, 0.18)';
                    } else {
                      // Normal / vibrant circles on light background
                      circleBorder = '1.5px solid rgba(0, 0, 0, 0.18)';
                      circleShadow = isSelected
                        ? '0 0 0 2.5px #059669, 0 3px 8px rgba(5, 150, 105, 0.4)'
                        : '0 1px 3px rgba(0, 0, 0, 0.12)';
                    }
                  }

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => applyPresetTheme(key)}
                      className="flex items-center justify-center p-1 group transition-transform active:scale-90 cursor-pointer rounded-full"
                      title={t.name}
                      aria-label={t.name}
                    >
                      <div
                        className={`w-[21.5px] h-[21.5px] rounded-full transition-all flex items-center justify-center relative overflow-hidden group/circle ${
                          isSelected
                            ? 'scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: circleBg,
                          border: isDarkCircle ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.7)',
                          boxShadow: isSelected 
                            ? `0 4px 0 0 ${isDarkCircle ? '#059669' : '#047857'}, 0 6px 13px rgba(0,0,0,0.4), inset 0 1.2px 1.2px rgba(255,255,255,0.7), inset 0 -1.5px 2.5px rgba(0,0,0,0.3)`
                            : `0 3.5px 0 0 ${isDarkCircle ? '#111111' : 'rgba(0,0,0,0.35)'}, 0 5px 11px -2px rgba(0,0,0,0.25), inset 0 1.2px 1.2px rgba(255,255,255,0.65), inset 0 -1.5px 2.5px rgba(0,0,0,0.25)`
                        }}
                      >
                        {/* 3D Glossy specular sheen across top half */}
                        <div className="absolute inset-x-0.5 top-0.5 h-[48%] rounded-t-full bg-gradient-to-b from-white/45 via-white/15 to-transparent pointer-events-none"></div>

                        {isSelected && (
                          <div
                            className="w-2 h-2 rounded-full shadow-md relative z-10"
                            style={{
                              backgroundColor: isDarkCircle ? '#10B981' : '#FFFFFF',
                              border: isDarkCircle 
                                ? '1px solid rgba(255, 255, 255, 0.9)' 
                                : '1px solid rgba(0, 0, 0, 0.35)',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.3)'
                            }}
                          />
                        )}
                      </div>
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
