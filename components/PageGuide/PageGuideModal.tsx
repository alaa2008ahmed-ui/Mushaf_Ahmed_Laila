import React, { useEffect } from 'react';
import { X, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { getPageGuide } from '../../data/pageGuidesData';
import { useTheme } from '../../context/ThemeContext';

interface PageGuideModalProps {
  pageKey: string;
  isOpen: boolean;
  onClose: () => void;
}

export const PageGuideModal: React.FC<PageGuideModalProps> = ({
  pageKey,
  isOpen,
  onClose
}) => {
  const { theme, themeKey } = useTheme();

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const guide = getPageGuide(pageKey);
  const isBlackTheme = theme?.bgColor === '#000000' || themeKey === 'deep_black' || theme?.name === 'اسود' || theme?.name === 'black';
  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme?.palette?.[0] || '#10b981');
  const textColor = isBlackTheme ? '#FFFFFF' : (theme?.textColor || '#1f2937');
  const modalBg = isBlackTheme ? '#0a0a0a' : (theme?.modalBg || theme?.cardBg || '#ffffff');
  const borderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.25)' : (theme?.palette?.[0] ? `${theme.palette[0]}40` : 'rgba(16, 185, 129, 0.3)');

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fadeIn select-none"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-lg max-h-[88vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border-2 animate-scaleUp"
        style={{
          backgroundColor: modalBg,
          color: textColor,
          borderColor: borderColor,
          fontFamily: theme?.font
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div 
          className="p-4 sm:p-5 border-b flex items-center justify-between shrink-0 relative"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-sm"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : `${primaryAccent}18`,
                color: primaryAccent
              }}
            >
              <i className={guide.icon}></i>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black font-kufi truncate">
                  {guide.title}
                </h2>
                <span 
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : `${primaryAccent}20`,
                    color: primaryAccent
                  }}
                >
                  {guide.badge}
                </span>
              </div>
              <p className="text-[11px] opacity-75 truncate mt-0.5 font-bold">
                {guide.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 shrink-0 cursor-pointer"
            title="إغلاق"
            aria-label="إغلاق"
            style={{ color: textColor }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 no-scrollbar">
          {/* Summary Card */}
          <div 
            className="p-3.5 rounded-2xl border text-xs leading-relaxed font-bold flex items-start gap-2.5"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.06)' : `${primaryAccent}0d`,
              borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : `${primaryAccent}26`,
              color: textColor
            }}
          >
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <p className="opacity-90">{guide.summary}</p>
          </div>

          {/* Guide Sections */}
          {guide.sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-2">
              <div className="flex items-center gap-2">
                {section.icon && <i className={`${section.icon} text-xs`} style={{ color: primaryAccent }}></i>}
                <h3 className="text-xs sm:text-sm font-black font-kufi" style={{ color: primaryAccent }}>
                  {section.title}
                </h3>
              </div>

              <div className="space-y-2">
                {section.items.map((item, iIdx) => (
                  <div 
                    key={iIdx}
                    className="p-3 rounded-2xl border transition-all text-xs flex flex-col gap-1"
                    style={{
                      backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
                      borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <span 
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-md"
                          style={{
                            backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : `${primaryAccent}15`,
                            color: primaryAccent
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs opacity-80 leading-relaxed font-bold pr-5" style={{ color: textColor }}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips Section */}
          {guide.tips && guide.tips.length > 0 && (
            <div 
              className="p-3.5 rounded-2xl border space-y-2 text-xs"
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.05)' : 'rgba(234, 179, 8, 0.08)',
                borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.18)' : 'rgba(234, 179, 8, 0.3)'
              }}
            >
              <div className="flex items-center gap-1.5 font-black text-amber-500">
                <Lightbulb className="w-4 h-4 shrink-0" />
                <span>نصائح وإرشادات ذكية:</span>
              </div>
              <ul className="space-y-1.5 pr-2">
                {guide.tips.map((tip, tIdx) => (
                  <li key={tIdx} className="text-[11px] font-bold opacity-90 list-disc list-inside leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div 
          className="p-3 sm:p-4 border-t flex items-center justify-between gap-3 shrink-0"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.08)' }}
        >
          <span className="text-[10px] font-bold opacity-60">
            مصحف أحمد وليلى • تلاوة وتدبر
          </span>

          <button
            onClick={onClose}
            className="py-2 px-5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer shadow-md"
            style={{
              backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent,
              color: isBlackTheme ? '#000000' : '#FFFFFF'
            }}
          >
            فهمت ذلك
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageGuideModal;
