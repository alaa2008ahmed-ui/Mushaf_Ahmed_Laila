import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check, ChevronRight, HelpCircle } from 'lucide-react';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CommunitySpotlightGuide, getGuideSeen } from './Community/CommunitySpotlightGuide';
import { CUSTOM_HABIT_MODAL_STEPS } from './Community/communityTourSteps';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

interface CustomHabitModalProps {
  hexColor: string;
  isBlackTheme: boolean;
  onClose: () => void;
  onAdded?: (habitTitle: string) => void;
  onNavigate?: (pageId: string, params?: any) => void;
}

const ICONS_LIST = ['🌙', '☀️', '📖', '🤲', '📿', '💧', '🕌', '🤍', '⭐', '🤝', '🌿', '🕊️'];

export const CustomHabitModal: React.FC<CustomHabitModalProps> = ({
  hexColor,
  isBlackTheme,
  onClose,
  onAdded,
  onNavigate
}) => {
  const { theme, themeKey } = useTheme();
  const tokens = getModernFlatTokens(theme, themeKey);
  const { language } = useLanguage();
  const isEn = language === 'en';
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!getGuideSeen('custom_habit_modal_spotlight')) {
      const timer = setTimeout(() => {
        setShowGuide(true);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const DAYS_LIST = isEn ? [
    { id: 6, label: 'Sat' },
    { id: 0, label: 'Sun' },
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
  ] : [
    { id: 6, label: 'السبت' },
    { id: 0, label: 'الأحد' },
    { id: 1, label: 'الاثنين' },
    { id: 2, label: 'الثلاثاء' },
    { id: 3, label: 'الأربعاء' },
    { id: 4, label: 'الخميس' },
    { id: 5, label: 'الجمعة' },
  ];

  const addCustomHabit = useHabitTracker((state) => state.addCustomHabit);

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌙');
  const [isSpecificDays, setIsSpecificDays] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 4]); // default Mon & Thu if toggled
  const [errorMsg, setErrorMsg] = useState('');

  const handleToggleDay = (dayId: number) => {
    if (selectedDays.includes(dayId)) {
      const next = selectedDays.filter((d) => d !== dayId);
      setSelectedDays(next);
      if (next.length === 0) {
        setIsSpecificDays(false);
      }
    } else {
      setSelectedDays([...selectedDays, dayId]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg(isEn ? 'Please enter a habit name' : 'يرجى كتابة اسم العبادة أولاً');
      return;
    }

    addCustomHabit({
      title: title.trim(),
      icon: selectedIcon,
      description: '',
      days: isSpecificDays ? selectedDays : []
    });

    if (onAdded) onAdded(title.trim());
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4" 
      onClick={onClose}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <motion.div 
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="w-full max-w-lg rounded-t-[28px] sm:rounded-[24px] overflow-hidden flex flex-col max-h-[90vh] shadow-2xl border-0"
        style={{ 
          backgroundColor: tokens.cardBgColor, 
          color: tokens.textColor,
          fontFamily: theme.font
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 dark:border-zinc-800">
          <h2 className="text-base sm:text-lg font-bold" style={{ color: tokens.textColor }}>
            {isEn ? 'Add Custom Worship' : 'إضافة عبادة أو طاعة'}
          </h2>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowGuide(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
              title={isEn ? "Guide" : "دليل الإضافة"}
            >
              <HelpCircle size={18} style={{ color: tokens.textColor }} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer border-0"
            >
              <X size={18} style={{ color: tokens.textColor }} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <main className="flex-1 overflow-y-auto px-5 py-4 hide-scrollbar">
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Title Input - Flat Surface */}
            <div 
              id="custom-habit-title-box"
              className="p-4 rounded-[18px] border-0"
              style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
            >
              <label className="block text-xs font-bold mb-2" style={{ color: tokens.textColor }}>
                {isEn ? 'Habit or Worship Name' : 'اسم العبادة أو الطاعة'} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder={isEn ? 'e.g. Fasting Mondays and Thursdays, Duha prayer...' : 'مثال: صيام الاثنين والخميس، أو ركعتي الضحى...'}
                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-zinc-800 text-sm font-semibold focus:outline-none placeholder-gray-400 border-0 shadow-xs"
                style={{ color: tokens.textColor }}
              />
              {errorMsg && (
                <p className="text-xs text-red-500 mt-1.5 font-semibold">{errorMsg}</p>
              )}
            </div>

            {/* Icon Selector - Flat Surface */}
            <div 
              id="custom-habit-icon-box"
              className="p-4 rounded-[18px] border-0"
              style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
            >
              <label className="block text-xs font-bold mb-2.5" style={{ color: tokens.textColor }}>
                {isEn ? 'Choose habit icon:' : 'اختر رمز العبادة:'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS_LIST.map((ic) => {
                  const isSelected = selectedIcon === ic;
                  return (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setSelectedIcon(ic)}
                      className={`h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer border-0 ${
                        isSelected
                          ? 'shadow-sm scale-105'
                          : 'hover:scale-105 bg-white dark:bg-zinc-800'
                      }`}
                      style={{
                        backgroundColor: isSelected ? hexToRgba(tokens.primaryColor, 0.15) : undefined,
                        boxShadow: isSelected ? `0 0 0 2px ${tokens.primaryColor}` : undefined
                      }}
                    >
                      {ic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurrence Mode - Flat Segmented Control */}
            <div 
              id="custom-habit-recurrence-box"
              className="p-4 rounded-[18px] border-0"
              style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
            >
              <label className="block text-xs font-bold mb-2.5" style={{ color: tokens.textColor }}>
                {isEn ? 'Habit frequency:' : 'تكرار العبادة:'}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(false);
                    setSelectedDays([]);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    !isSpecificDays
                      ? 'shadow-sm'
                      : 'opacity-70 bg-white dark:bg-zinc-800'
                  }`}
                  style={{
                    backgroundColor: !isSpecificDays ? tokens.primaryColor : undefined,
                    color: !isSpecificDays ? '#FFFFFF' : tokens.textColor
                  }}
                >
                  {isEn ? 'Daily (Every day)' : 'يومياً (كل يوم)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(true);
                    if (selectedDays.length === 0) setSelectedDays([1, 4]);
                  }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                    isSpecificDays
                      ? 'shadow-sm'
                      : 'opacity-70 bg-white dark:bg-zinc-800'
                  }`}
                  style={{
                    backgroundColor: isSpecificDays ? tokens.primaryColor : undefined,
                    color: isSpecificDays ? '#FFFFFF' : tokens.textColor
                  }}
                >
                  {isEn ? 'Specific days of the week' : 'أيام محددة في الأسبوع'}
                </button>
              </div>

              {/* Days Selection when Specific */}
              {isSpecificDays && (
                <div 
                  className="p-3.5 rounded-xl space-y-3 bg-white dark:bg-zinc-800 border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold opacity-80" style={{ color: tokens.subtextColor }}>
                      {isEn ? 'Select scheduled days:' : 'حدد الأيام المجدولة:'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDays([1, 4])}
                        className="text-[10px] py-1 px-2.5 rounded-lg font-bold border-0 cursor-pointer"
                        style={{
                          backgroundColor: hexToRgba(tokens.primaryColor, 0.12),
                          color: tokens.primaryColor
                        }}
                      >
                        {isEn ? 'Mon & Thu' : 'الاثنين والخميس'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDays([5])}
                        className="text-[10px] py-1 px-2.5 rounded-lg font-bold border-0 cursor-pointer bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      >
                        {isEn ? 'Friday only' : 'الجمعة فقط'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {DAYS_LIST.map((d) => {
                      const isSelected = selectedDays.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleToggleDay(d.id)}
                          className={`py-2 px-1 rounded-xl text-xs font-bold transition-all border-0 cursor-pointer ${
                            isSelected
                              ? 'shadow-xs'
                              : 'bg-slate-100 dark:bg-zinc-700'
                          }`}
                          style={{
                            backgroundColor: isSelected ? tokens.primaryColor : undefined,
                            color: isSelected ? '#FFFFFF' : tokens.textColor
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2.5">
              <motion.button
                id="custom-habit-save-btn"
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm shadow-sm flex items-center justify-center gap-2 text-white cursor-pointer border-0"
                style={{ backgroundColor: tokens.primaryColor }}
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'Add Habit' : 'إضافة العبادة للطاعات 🌿'}</span>
              </motion.button>
              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 transition-colors cursor-pointer border-0"
                style={{ color: tokens.textColor }}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </form>
        </main>

        <CommunitySpotlightGuide
          guideKey="custom_habit_modal_spotlight"
          steps={CUSTOM_HABIT_MODAL_STEPS}
          isOpen={showGuide}
          onClose={() => setShowGuide(false)}
          isEn={isEn}
        />
      </motion.div>
    </div>
  );
};

export default CustomHabitModal;
