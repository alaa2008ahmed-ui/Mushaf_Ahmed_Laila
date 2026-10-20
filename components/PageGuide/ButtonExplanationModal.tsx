import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { translateExplanationData, tGuide } from './pageGuideTranslations';

export interface ButtonExplanationData {
  title: string;
  subtitle?: string;
  icon?: string | React.ReactNode;
  badge?: string;
  purpose?: string;
  singleClickAction?: string;
  longPressAction?: string;
  details?: string[];
}

interface ButtonExplanationModalProps {
  data: ButtonExplanationData | null;
  onClose: () => void;
}

export const ButtonExplanationModal: React.FC<ButtonExplanationModalProps> = ({
  data: rawData,
  onClose
}) => {
  const { theme, themeKey } = useTheme();
  const { language, isRTL, dir } = useLanguage();
  const isEn = language === 'en';

  // Translate data if in English mode
  const data = rawData ? (isEn ? translateExplanationData(rawData, 'en') : rawData) : null;

  // Close on Escape key
  useEffect(() => {
    if (!data) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [data, onClose]);

  if (!data) return null;

  const isBlackTheme = theme?.bgColor === '#000000' || themeKey === 'deep_black';
  const textColor = isBlackTheme ? '#FFFFFF' : (theme?.textColor || '#1f2937');
  const modalBg = isBlackTheme ? '#121212' : '#ffffff';
  const borderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.3)' : '#000000';

  // استخراج وتنسيق خاصيتي النقرة الواحدة والضغط المطول
  let singleClick = data.singleClickAction || '';
  let longPress = data.longPressAction || '';
  let generalPurpose = data.purpose || '';

  // استخراج تلقائي إذا كان النص يحتوي على نمط نقرة واحدة / ضغط مطول
  if (!singleClick && generalPurpose.includes('نقرة واحدة:')) {
    const parts = generalPurpose.split(/الضغط المطول:|ضغط مطول:/i);
    const firstPart = parts[0];
    const secondPart = parts[1];
    if (firstPart.includes('نقرة واحدة:')) {
      const subParts = firstPart.split('نقرة واحدة:');
      generalPurpose = subParts[0].trim();
      singleClick = subParts[1].trim();
    }
    if (secondPart) {
      longPress = secondPart.trim();
    }
  }

  // تجميع النص الاحتياطي
  const explanationParts: string[] = [];
  if (generalPurpose) explanationParts.push(generalPurpose);
  if (singleClick) explanationParts.push(isEn ? `• Tap: ${singleClick}` : `• عند النقر: ${singleClick}`);
  if (longPress) explanationParts.push(isEn ? `• Long press: ${longPress}` : `• عند الضغط المطول: ${longPress}`);
  if (data.details && data.details.length > 0) {
    data.details.forEach(detail => {
      const translatedDetail = isEn ? tGuide(detail, 'en') : detail;
      if (!explanationParts.includes(translatedDetail) && translatedDetail !== generalPurpose) {
        explanationParts.push(`• ${translatedDetail}`);
      }
    });
  }
  const fullExplanationText = explanationParts.length > 0 
    ? explanationParts.join('\n\n') 
    : (data.title || (isEn ? 'Button or Item Explanation' : 'شرح الزر أو العنصر'));

  return (
    <div 
      className="fixed inset-0 z-[99999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn select-none"
      onClick={onClose}
      dir={dir}
    >
      <div 
        className="w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden relative border-2 animate-scaleUp"
        style={{
          backgroundColor: modalBg,
          color: textColor,
          borderColor: borderColor,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هيدر بسيط: عنوان الزر أو البطاقة وزر الإغلاق */}
        <div 
          className="py-3.5 px-4 border-b flex items-center justify-between shrink-0"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }}
        >
          <h2 className={`text-base sm:text-lg font-black ${isEn ? 'font-sans' : 'font-kufi'} truncate flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
            {data.title}
          </h2>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 shrink-0 cursor-pointer ${isRTL ? 'mr-2' : 'ml-2'}`}
            title={isEn ? "Close" : "إغلاق"}
            aria-label={isEn ? "Close" : "إغلاق"}
            style={{ color: textColor }}
          >
            <X size={20} />
          </button>
        </div>

        {/* محتوى الشرح: كل خاصية في بطاقة مستقلة بذاتها */}
        <div className="p-4 sm:p-5 overflow-y-auto max-h-[65vh] flex flex-col gap-3 custom-scrollbar">
          
          {/* بطاقة النبذة العامة إذا وجدت وكانت غير مكررة */}
          {generalPurpose && generalPurpose.length > 3 && (
            <div 
              className="p-3.5 rounded-xl border flex flex-col gap-1"
              style={{ 
                backgroundColor: isBlackTheme ? '#1e1e1e' : '#f8fafc',
                borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0'
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-xs opacity-75">
                <span>ℹ️</span>
                <span>{isEn ? "Primary Function" : "الوظيفة الأساسية"}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed">
                {generalPurpose}
              </p>
            </div>
          )}

          {/* بطاقة الخاصية الأولى: نقرة واحدة */}
          {singleClick && (
            <div 
              className="p-4 rounded-xl border flex flex-col gap-1.5 shadow-xs"
              style={{ 
                backgroundColor: isBlackTheme ? '#102436' : '#eff6ff',
                borderColor: isBlackTheme ? '#0284c7' : '#93c5fd'
              }}
            >
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs">👆</span>
                <span>{isEn ? "Single Tap" : "نقرة واحدة"}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-100">
                {singleClick}
              </p>
            </div>
          )}

          {/* بطاقة الخاصية الثانية: الضغط المطول */}
          {longPress && (
            <div 
              className="p-4 rounded-xl border flex flex-col gap-1.5 shadow-xs"
              style={{ 
                backgroundColor: isBlackTheme ? '#2a1a12' : '#fffbeb',
                borderColor: isBlackTheme ? '#ea580c' : '#fde68a'
              }}
            >
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-black text-sm">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs">⏱️</span>
                <span>{isEn ? "Long Press" : "الضغط المطول"}</span>
              </div>
              <p className="text-sm font-semibold leading-relaxed text-gray-800 dark:text-gray-100">
                {longPress}
              </p>
            </div>
          )}

          {/* في حال عدم وجود نقرة أو ضغط مطول منفصل، عرض النص كاملاً في بطاقة أنيقة */}
          {!singleClick && !longPress && !generalPurpose && (
            <div 
              className="p-4 rounded-xl border leading-relaxed text-sm font-semibold whitespace-pre-line"
              style={{ 
                backgroundColor: isBlackTheme ? '#1e1e1e' : '#f8fafc',
                borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : '#e2e8f0'
              }}
            >
              {fullExplanationText}
            </div>
          )}
        </div>

        {/* زر إغلاق نظيف في الأسفل */}
        <div 
          className="p-3 border-t shrink-0 flex justify-center"
          style={{ borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.1)' }}
        >
          <button
            onClick={onClose}
            className="w-full py-2.5 px-6 rounded-xl font-bold text-sm bg-black text-white dark:bg-white dark:text-black transition-transform active:scale-95 cursor-pointer text-center"
          >
            {isEn ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ButtonExplanationModal;
