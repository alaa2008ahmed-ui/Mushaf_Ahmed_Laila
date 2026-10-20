import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isDarkBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black' || isBlackTheme;

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

  const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isDarkBlack 
        ? '#FFFFFF' 
        : (theme.palette?.[0] || '#000000'));

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
      setErrorMsg('يرجى كتابة اسم العبادة أولاً');
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
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100"
        dir="rtl"
      >
        {/* Full Screen Top Header */}
        <header className="app-top-bar shrink-0">
          <div className="app-top-bar__inner">
            <div className="relative flex items-center justify-center w-full min-h-[44px]">
              {/* سهم الرجوع للخلف على يمين النص */}
              <div className="absolute right-0 flex items-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title="رجوع للخلف"
                  aria-label="رجوع للخلف"
                >
                  <i className="fa-solid fa-arrow-right text-xl"></i>
                </button>
              </div>

              {/* عنوان الصفحة في الوسط */}
              <div className="text-center px-12 min-w-0">
                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                  {isEn ? 'Add Habit' : 'إضافة عبادة'}
                </h1>
              </div>

              {/* أيقونة المنزل على يسار النص للعودة إلى الصفحة الرئيسية */}
              <div className="absolute left-0 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onNavigate) onNavigate('home');
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title="الصفحة الرئيسية"
                  aria-label="الصفحة الرئيسية"
                >
                  <i className="fa-solid fa-house text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Form Body */}
        <main 
          className="flex-1 overflow-y-auto px-4 pt-3 max-w-lg mx-auto w-full overscroll-contain"
          style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)' }}
        >
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Title Input */}
            <div 
              className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl shadow-xs border"
              style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errorMsg && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{isEn ? 'Please enter a habit name' : errorMsg}</p>
              )}
            </div>

            {/* Icon Selector */}
            <div 
              className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl shadow-xs border"
              style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Choose habit icon:' : 'اختر رمز العبادة:'}
              </label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS_LIST.map((ic) => (
                  <button
                    type="button"
                    key={ic}
                    onClick={() => setSelectedIcon(ic)}
                    className={`h-11 rounded-xl flex items-center justify-center text-lg transition-transform ${
                      selectedIcon === ic
                        ? 'bg-amber-100 dark:bg-amber-900/40 border-2 border-amber-500 scale-105 shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:scale-102'
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>

            {/* Recurrence Mode */}
            <div 
              className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl shadow-xs border"
              style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                {isEn ? 'Habit frequency:' : 'تكرار العبادة:'}
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(false);
                    setSelectedDays([]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    !isSpecificDays
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isEn ? 'Daily (Every day)' : 'يومياً (كل يوم)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(true);
                    if (selectedDays.length === 0) setSelectedDays([1, 4]);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors ${
                    isSpecificDays
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {isEn ? 'Specific days of the week' : 'أيام محددة في الأسبوع'}
                </button>
              </div>

              {/* Days Selection when Specific */}
              {isSpecificDays && (
                <div 
                  className="bg-gray-50 dark:bg-gray-900/70 p-3 rounded-2xl border space-y-2"
                  style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                      {isEn ? 'Select scheduled days:' : 'حدد الأيام المجدولة:'}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDays([1, 4])}
                        className="text-[10px] py-0.5 px-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold"
                      >
                        {isEn ? 'Mon & Thu' : 'الاثنين والخميس'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDays([5])}
                        className="text-[10px] py-0.5 px-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold"
                      >
                        {isEn ? 'Friday only' : 'الجمعة فقط'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1">
                    {DAYS_LIST.map((d) => {
                      const isSelected = selectedDays.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleToggleDay(d.id)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-bold transition-all border ${
                            isSelected
                              ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                              : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                          }`}
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
            <div className="pt-2 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 ${isDarkBlack ? 'text-black' : 'text-white'}`}
                style={{ backgroundColor: hexColor }}
              >
                <Plus className="w-4 h-4" />
                <span>{isEn ? 'Add Habit' : 'إضافة العبادة للطاعات 🌿'}</span>
              </motion.button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </form>
        </main>
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomHabitModal;
