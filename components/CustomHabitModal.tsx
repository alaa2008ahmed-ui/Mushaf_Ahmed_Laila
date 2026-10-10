import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Check, ChevronRight } from 'lucide-react';
import { useHabitTracker } from '../hooks/useHabitTracker';
import BottomBar from './BottomBar';

interface CustomHabitModalProps {
  hexColor: string;
  isBlackTheme: boolean;
  onClose: () => void;
  onAdded?: (habitTitle: string) => void;
}

const ICONS_LIST = ['🌙', '☀️', '📖', '🤲', '📿', '💧', '🕌', '🤍', '⭐', '🤝', '🌿', '🕊️'];

const DAYS_LIST = [
  { id: 6, label: 'السبت' },
  { id: 0, label: 'الأحد' },
  { id: 1, label: 'الاثنين' },
  { id: 2, label: 'الثلاثاء' },
  { id: 3, label: 'الأربعاء' },
  { id: 4, label: 'الخميس' },
  { id: 5, label: 'الجمعة' },
];

const PRESETS = [
  { title: 'صيام الاثنين والخميس', icon: '🌙', days: [1, 4], desc: 'سنة نبوية مباركة' },
  { title: 'ركعتا الضحى', icon: '☀️', days: [], desc: 'صلاة الأوابين' },
  { title: 'قراءة سورة الملك', icon: '📖', days: [], desc: 'المانعة من عذاب القبر' },
  { title: 'بر الوالدين والاتصال بهما', icon: '🤍', days: [], desc: 'أعظم القربات إلى الله' },
  { title: 'صلة الرحم والسؤال عن الأهل', icon: '🤝', days: [5], desc: 'بركة في الرزق والعمر' },
  { title: 'صدقة يومية / إطعام', icon: '💧', days: [], desc: 'الصدقة تطفئ غضب الرب' },
  { title: 'الاستغفار ١٠٠ مرة', icon: '📿', days: [], desc: 'مغفرة للذنوب وتفريج للكرب' },
  { title: 'ركعتا قيام الليل', icon: '🤲', days: [], desc: 'شرف المؤمن قيام الليل' },
];

export const CustomHabitModal: React.FC<CustomHabitModalProps> = ({
  hexColor,
  isBlackTheme,
  onClose,
  onAdded
}) => {
  const addCustomHabit = useHabitTracker((state) => state.addCustomHabit);

  const [title, setTitle] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🌙');
  const [description, setDescription] = useState('');
  const [isSpecificDays, setIsSpecificDays] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 4]); // default Mon & Thu if toggled
  const [errorMsg, setErrorMsg] = useState('');

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setTitle(preset.title);
    setSelectedIcon(preset.icon);
    setDescription(preset.desc);
    if (preset.days && preset.days.length > 0) {
      setIsSpecificDays(true);
      setSelectedDays(preset.days);
    } else {
      setIsSpecificDays(false);
      setSelectedDays([]);
    }
  };

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
      description: description.trim(),
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
            <div className="relative flex items-center justify-center w-full px-2">
              <div className="text-center w-full">
                <h1 className="app-top-bar__title text-xl font-kufi">
                  إضافة عبادة
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Form Body */}
        <main className="flex-1 overflow-y-auto px-4 pt-3 pb-36 max-w-lg mx-auto w-full overscroll-contain">
          <form onSubmit={handleSave} className="space-y-4">
            
            {/* Quick Preset Badges */}
            <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                اقتراحات سريعة بنقرة واحدة:
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pb-1">
                {PRESETS.map((p, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => handleSelectPreset(p)}
                    className={`text-xs py-1.5 px-3 rounded-xl border flex items-center gap-1.5 transition-all ${
                      title === p.title
                        ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-bold border-transparent shadow-sm'
                        : 'bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{p.icon}</span>
                    <span>{p.title}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title Input */}
            <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                اسم العبادة أو الطاعة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="مثال: صيام الاثنين والخميس، أو ركعتي الضحى..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {errorMsg && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errorMsg}</p>
              )}
            </div>

            {/* Icon Selector */}
            <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                اختر رمز العبادة:
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
            <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                تكرار العبادة:
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
                  يومياً (كل يوم)
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
                  أيام محددة في الأسبوع
                </button>
              </div>

              {/* Days Selection when Specific */}
              {isSpecificDays && (
                <div className="bg-gray-50 dark:bg-gray-900/70 p-3 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-400">
                      حدد الأيام المجدولة:
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDays([1, 4])}
                        className="text-[10px] py-0.5 px-2 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-bold"
                      >
                        الاثنين والخميس
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDays([5])}
                        className="text-[10px] py-0.5 px-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 font-bold"
                      >
                        الجمعة فقط
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

            {/* Description (Optional) */}
            <div className="bg-white dark:bg-gray-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                ملاحظة أو وصف مختصر (اختياري):
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="مثال: ركعتان بعد الشروق، أو قبل النوم..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-2">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-md flex items-center justify-center gap-2"
                style={{ backgroundColor: hexColor }}
              >
                <Plus className="w-4 h-4" />
                <span>إضافة العبادة للطاعات 🌿</span>
              </motion.button>
              <button
                type="button"
                onClick={onClose}
                className="py-3 px-4 rounded-xl font-bold text-sm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </form>
        </main>

        {/* Bottom Bar with Home button */}
        <BottomBar onHomeClick={onClose} onThemesClick={() => {}} showThemes={false} />
      </motion.div>
    </AnimatePresence>
  );
};

export default CustomHabitModal;
