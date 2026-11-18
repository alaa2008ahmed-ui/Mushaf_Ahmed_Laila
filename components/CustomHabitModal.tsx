import React, { useState, useEffect } from 'react';
import { X, Plus, HelpCircle } from 'lucide-react';
import { useHabitTracker } from '../hooks/useHabitTracker';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CommunitySpotlightGuide, getGuideSeen } from './Community/CommunitySpotlightGuide';
import { CUSTOM_HABIT_MODAL_STEPS } from './Community/communityTourSteps';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';
import { useShowPageGuides } from '../utils/guideManager';

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
  const showPageGuides = useShowPageGuides();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4" 
      onClick={onClose}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div 
        className={`app-page-card border-0 w-full max-w-lg rounded-t-[28px] sm:rounded-3xl overflow-hidden flex flex-col max-h-[90dvh] ${s3d.surfaceCardClass}`}
        style={{ fontFamily: theme.font }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Drag Handle */}
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-600" />
        </div>

        {/* Header */}
        <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${s3d.dividerClass}`}>
          <h2 className="text-base sm:text-lg font-extrabold" style={{ color: s3d.textColor }}>
            {isEn ? 'Add Custom Worship' : 'إضافة عبادة أو طاعة'}
          </h2>

          <div className="flex items-center gap-2 overflow-visible pb-1">
            {showPageGuides && (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className={`app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                title={isEn ? "Guide" : "دليل الإضافة"}
              >
                <HelpCircle size={18} style={{ color: s3d.textColor }} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`app-page-card border-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${s3d.surfaceCardClass}`}
            >
              <X size={18} style={{ color: s3d.textColor }} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <main className="flex-1 min-h-0 overflow-y-auto px-5 pt-4 pb-6 hide-scrollbar">
          <form id="custom-habit-form" onSubmit={handleSave} className="space-y-4">
            
            {/* Title Input - 3D Sculpted Surface */}
            <div 
              id="custom-habit-title-box"
              className={`app-page-card border-0 p-4 rounded-2xl ${s3d.surfaceCardClass}`}
            >
              <label className="block text-xs font-extrabold mb-2.5" style={{ color: s3d.textColor }}>
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
                className={`app-3d-recessed-field border-0 w-full px-4 py-3.5 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 ${s3d.recessedInputClass}`}
              />
              {errorMsg && (
                <p className="text-xs text-red-500 mt-2 font-bold">{errorMsg}</p>
              )}
            </div>

            {/* Icon Selector - 3D Sculpted Surface */}
            <div 
              id="custom-habit-icon-box"
              className={`app-page-card border-0 p-4 rounded-2xl overflow-visible ${s3d.surfaceCardClass}`}
            >
              <label className="block text-xs font-extrabold mb-3" style={{ color: s3d.textColor }}>
                {isEn ? 'Choose habit icon:' : 'اختر رمز العبادة:'}
              </label>
              <div className="grid grid-cols-6 gap-2.5 overflow-visible pb-1">
                {ICONS_LIST.map((ic) => {
                  const isSelected = selectedIcon === ic;
                  const isDarkSurface = Boolean(theme.isDark) || Boolean(isNightMode) || s3d.isBlackTheme || themeKey === 'black_gold';
                  return (
                    <button
                      type="button"
                      key={ic}
                      onClick={() => setSelectedIcon(ic)}
                      className={`${isSelected ? 'unified-3d-btn' : 'app-page-card'} border-0 h-11 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer ${s3d.surfaceCardClass}`}
                      style={isSelected ? {
                        backgroundColor: s3d.activeTintBg,
                        boxShadow: isDarkSurface
                          ? `0 0 0 2px ${s3d.isBlackTheme ? '#FFFFFF' : s3d.primaryColor}, 0 5.5px 0 #09090b, 0 10px 18px rgba(0, 0, 0, 0.72), inset 0 2px 2px rgba(255, 255, 255, 0.25)`
                          : `0 0 0 2px ${s3d.primaryColor}, 0 5.5px 0 rgba(0, 0, 0, 0.14), 0 10px 18px -2px rgba(0, 0, 0, 0.12), inset 0 2px 2px rgba(255, 255, 255, 0.92)`
                      } : undefined}
                    >
                      {ic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Recurrence Mode - 3D Segmented Control */}
            <div 
              id="custom-habit-recurrence-box"
              className={`app-page-card border-0 p-4 rounded-2xl overflow-visible ${s3d.surfaceCardClass}`}
            >
              <label className="block text-xs font-extrabold mb-3" style={{ color: s3d.textColor }}>
                {isEn ? 'Habit frequency:' : 'تكرار العبادة:'}
              </label>
              <div className="grid grid-cols-2 gap-2.5 mb-3 overflow-visible pb-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(false);
                    setSelectedDays([]);
                  }}
                  className={`app-page-card border-0 py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer ${
                    !isSpecificDays
                      ? 'font-black'
                      : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                  }`}
                  style={!isSpecificDays ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                >
                  {isEn ? 'Daily (Every day)' : 'يومياً (كل يوم)'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSpecificDays(true);
                    if (selectedDays.length === 0) setSelectedDays([1, 4]);
                  }}
                  className={`app-page-card border-0 py-2.5 px-3 rounded-xl text-xs transition-all cursor-pointer ${
                    isSpecificDays
                      ? 'font-black'
                      : `font-bold opacity-85 ${s3d.surfaceCardClass}`
                  }`}
                  style={isSpecificDays ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                >
                  {isEn ? 'Specific days of the week' : 'أيام محددة في الأسبوع'}
                </button>
              </div>

              {/* Days Selection when Specific */}
              {isSpecificDays && (
                <div 
                  className={`app-3d-recessed-field border-0 p-3.5 rounded-2xl space-y-3 overflow-visible ${s3d.recessedInputClass}`}
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap overflow-visible pb-1">
                    <span className="text-[11px] font-bold" style={{ color: s3d.subtextColor }}>
                      {isEn ? 'Select scheduled days:' : 'حدد الأيام المجدولة:'}
                    </span>
                    <div className="flex gap-1.5 overflow-visible">
                      <button
                        type="button"
                        onClick={() => setSelectedDays([1, 4])}
                        className={`app-page-card border-0 text-[10px] py-1.5 px-2.5 rounded-xl font-bold cursor-pointer ${s3d.surfaceCardClass}`}
                        style={{ color: s3d.isBlackTheme ? '#FFFFFF' : s3d.primaryColor }}
                      >
                        {isEn ? 'Mon & Thu' : 'الاثنين والخميس'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedDays([5])}
                        className={`app-page-card border-0 text-[10px] py-1.5 px-2.5 rounded-xl font-bold cursor-pointer text-blue-600 dark:text-blue-400 ${s3d.surfaceCardClass}`}
                      >
                        {isEn ? 'Friday only' : 'الجمعة فقط'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 overflow-visible pb-1">
                    {DAYS_LIST.map((d) => {
                      const isSelected = selectedDays.includes(d.id);
                      return (
                        <button
                          type="button"
                          key={d.id}
                          onClick={() => handleToggleDay(d.id)}
                          className={`app-page-card border-0 py-2 px-1 rounded-xl text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'font-black'
                              : `font-bold ${s3d.surfaceCardClass}`
                          }`}
                          style={isSelected ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </form>
        </main>

        {/* Action Buttons Footer elevated clearly above phone bottom navigation bar */}
        <div
          className={`px-5 pt-3.5 modal-sheet-safe-bottom shrink-0 border-t ${s3d.dividerClass} flex gap-2.5 overflow-visible ${s3d.surfaceCardClass}`}
        >
          <button
            id="custom-habit-save-btn"
            type="submit"
            form="custom-habit-form"
            className="app-page-card border-0 flex-1 py-3.5 px-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 cursor-pointer"
            style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
          >
            <Plus className="w-4 h-4 stroke-[2.75]" />
            <span>{isEn ? 'Add Habit' : 'إضافة العبادة للطاعات 🌿'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`app-page-card border-0 py-3.5 px-5 rounded-2xl font-bold text-sm cursor-pointer ${s3d.surfaceCardClass}`}
          >
            {isEn ? 'Cancel' : 'إلغاء'}
          </button>
        </div>
      </div>

      <CommunitySpotlightGuide
        guideKey="custom_habit_modal_spotlight"
        steps={CUSTOM_HABIT_MODAL_STEPS}
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        isEn={isEn}
      />
    </div>
  );
};

export default CustomHabitModal;
