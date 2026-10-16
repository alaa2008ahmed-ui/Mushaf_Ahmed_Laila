import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { HelpCircle } from 'lucide-react';

interface FloatingHelpButtonProps {
  onClick: () => void;
  currentPage?: string;
}

export const FloatingHelpButton: React.FC<FloatingHelpButtonProps> = ({ 
  onClick,
  currentPage 
}) => {
  const { theme, themeKey } = useTheme();
  const isBlackTheme = theme?.bgColor === '#000000' || themeKey === 'deep_black' || theme?.name === 'اسود' || theme?.name === 'black';
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  // الاستماع لحالة التمرير في الصفحة الرئيسية لاختفاء الأيقونة عند محاذاة بطاقة الصلوات
  useEffect(() => {
    const handleVisibility = (e: any) => {
      setIsScrolledPast(!!e.detail?.hide);
    };
    window.addEventListener('header_icons_visibility', handleVisibility);
    return () => window.removeEventListener('header_icons_visibility', handleVisibility);
  }, []);

  // إعادة التعيين عند الانتقال لصفحة أخرى
  useEffect(() => {
    setIsScrolledPast(false);
  }, [currentPage]);

  // إظهار الأيقونة فقط في الصفحة الرئيسية ('home')
  if (currentPage !== 'home') {
    return null;
  }

  // مطابقة لون أيقونة الثيمات تماماً
  const buttonColor = isBlackTheme
    ? '#FFFFFF'
    : (theme?.palette?.[2] && theme?.palette[2] !== theme?.palette[0] && theme?.palette[2] !== theme?.palette[1]) 
      ? theme.palette[2] 
      : (theme?.accent && theme?.accent !== theme?.palette[0] && theme?.accent !== theme?.palette[1]) 
        ? theme.accent 
        : (theme?.isDark ? '#FFFFFF' : '#000000');

  return (
    <button
      id="guide-help-btn"
      data-id="guide-help-button"
      type="button"
      onClick={onClick}
      className={`fixed top-[calc(env(safe-area-inset-top,20px)+88px)] right-3 z-[1240] w-[35px] h-[35px] flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 bg-transparent cursor-pointer group select-none ${
        isScrolledPast ? 'opacity-0 pointer-events-none scale-0 invisible' : 'opacity-100 scale-100 visible'
      }`}
      style={{
        color: buttonColor
      }}
      title="دليل صفحات التطبيق"
      aria-label="دليل صفحات التطبيق"
    >
      <HelpCircle className="w-[21px] h-[21px] transition-transform group-hover:scale-110" />
    </button>
  );
};

export default FloatingHelpButton;
