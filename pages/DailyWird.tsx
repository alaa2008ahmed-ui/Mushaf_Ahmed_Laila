import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { CheckCircle, BookOpen, RotateCcw, Play, Settings, X, User, Plus, Trash2, ChevronDown, Edit2, Home, HelpCircle, Bell, BellOff, Clock, Volume2, Sparkles, Languages, Check } from 'lucide-react';
import ThemePageLock from '../components/ThemePageLock';
import ResetConfirmModal from '../components/DailyWird/ResetConfirmModal';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { DAILY_SETTINGS_STEPS, DAILY_PROGRESS_STEPS } from '../components/Community/communityTourSteps';
import { syncDailyWirdNotifications, triggerTestWirdNotification } from '../utils/dailyWirdNotificationService';

interface WirdSettings {
  id: string;
  name: string;
  mode: 'days' | 'pages';
  value: number;
  startDate: string;
  currentDay: number;
  completedDays: number[];
  isActive: boolean;
  startPage?: number;
  lastPage?: number;
  lastAyah?: { s: number; a: number };
  reminderEnabled?: boolean;
  reminderTime?: string; // e.g. "09:00"
  lastCompletedDate?: string;
}

const TOTAL_PAGES = 604;

import { registerBackInterceptor } from '../hooks/useBackButton';

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const { language, isRTL } = useLanguage();
  const isEn = language === 'en';

  const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const isDefaultTheme = themeKey === 'default' || theme.name?.includes('الافتراضي') || (!themeKey);
  const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'أبيض وأسود';
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isBlackTheme 
        ? '#FFFFFF' 
        : (theme.palette?.[0] || '#000000'));
  const primaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
  const secondaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : (theme.palette[1] || theme.palette[0])));
  const btnTextColor = isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#000000' : '#FFFFFF'));

  const [allSettings, setAllSettings] = useState<WirdSettings[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempMode, setTempMode] = useState<'days' | 'pages'>('days');
  const [tempValue, setTempValue] = useState<string>('30');
  const [tempName, setTempName] = useState<string>('');
  const [tempReminderEnabled, setTempReminderEnabled] = useState<boolean>(true);
  const [tempReminderTime, setTempReminderTime] = useState<string>('09:00');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [calcMethod, setCalcMethod] = useState<'remaining' | 'total'>('remaining');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const settings = allSettings.find(s => s.id === activeId) || null;
  const [showSettingsTour, setShowSettingsTour] = useState(() => !settings && !getGuideSeen('daily_wird_settings_tour'));
  const [showProgressTour, setShowProgressTour] = useState(false);

  useEffect(() => {
    if (settings && !showSettings && !getGuideSeen('daily_wird_progress_tour') && !showSettingsTour) {
      setShowProgressTour(true);
    }
  }, [settings, showSettings, showSettingsTour]);

  const handleOpenGuide = useCallback(() => {
    if (showSettings || !settings) {
      setShowSettingsTour(true);
    } else {
      setShowProgressTour(true);
    }
  }, [showSettings, settings]);

  const toEnglishDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
              .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
  };

  useEffect(() => {
    const saved = localStorage.getItem('dailyWirdSettings_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const profiles = (parsed.profiles || []).map((p: any) => ({
        ...p,
        reminderEnabled: p.reminderEnabled !== false
      }));
      const activeProfileId = parsed.activeId || (profiles.length > 0 ? profiles[0].id : null);
      
      setAllSettings(profiles);
      setActiveId(activeProfileId);

      if (activeProfileId) {
        const activeProfile = profiles.find((p: WirdSettings) => p.id === activeProfileId);
        if (activeProfile) {
          const totalDays = activeProfile.mode === 'days' ? activeProfile.value : Math.ceil(TOTAL_PAGES / activeProfile.value);
          if (activeProfile.completedDays.length >= totalDays) {
            setTimeout(() => {
              const resetProfile: WirdSettings = {
                ...activeProfile,
                currentDay: 1,
                completedDays: [],
                startPage: 1,
                isActive: true
              };
              const newProfiles = profiles.map((p: WirdSettings) => p.id === activeProfile.id ? resetProfile : p);
              
              setAllSettings(newProfiles);
              setActiveId(activeProfile.id);
              localStorage.setItem('dailyWirdSettings_v2', JSON.stringify({ profiles: newProfiles, activeId: activeProfile.id }));
              
              setTempMode(activeProfile.mode);
              setTempValue(activeProfile.value.toString());
              setTempName(activeProfile.name);
              setCalcMethod('remaining');
              setShowSettings(true);
            }, 0);
          }
        }
      }
    } else {
      const oldSaved = localStorage.getItem('dailyWirdSettings');
      if (oldSaved) {
        const oldSettings = JSON.parse(oldSaved);
        const migrated: WirdSettings = {
          ...oldSettings,
          id: 'default',
          name: 'المستخدم 1'
        };
        setAllSettings([migrated]);
        setActiveId('default');
        localStorage.setItem('dailyWirdSettings_v2', JSON.stringify({ profiles: [migrated], activeId: 'default' }));
      } else {
        setShowSettings(true);
      }
    }
  }, []);

  const saveAllSettings = (profiles: WirdSettings[], activeProfileId: string | null) => {
    setAllSettings(profiles);
    setActiveId(activeProfileId);
    localStorage.setItem('dailyWirdSettings_v2', JSON.stringify({ profiles, activeId: activeProfileId }));
  };

  useEffect(() => {
    if (settings) {
      setTempReminderEnabled(settings.reminderEnabled !== false);
      setTempReminderTime(settings.reminderTime || '09:00');
    }
  }, [settings]);

  const handleStart = () => {
    const inputVal = parseInt(tempValue) || (tempMode === 'days' ? 30 : 20);
    let finalValue = inputVal;
    let startPage = 1;
    const profileName = tempName.trim() || (isEn ? `User ${allSettings.length + 1}` : `مستخدم ${allSettings.length + 1}`);

    if (settings && settings.completedDays.length > 0) {
      const lastPageRead = Math.max(0, ...settings.completedDays.map(d => getDayRange(d).end));
      startPage = lastPageRead + 1;

      if (tempMode === 'days' && calcMethod === 'total') {
        const completedDaysCount = settings.completedDays.length;
        finalValue = Math.max(1, inputVal - completedDaysCount);
      }
    }

    const newWird: WirdSettings = {
      id: settings?.id || Date.now().toString(),
      name: profileName,
      mode: tempMode,
      value: finalValue,
      startDate: settings ? settings.startDate : new Date().toISOString(),
      currentDay: settings ? settings.currentDay : 1,
      completedDays: settings ? settings.completedDays : [],
      isActive: true,
      startPage: startPage,
      lastPage: settings?.lastPage,
      lastAyah: settings?.lastAyah,
      reminderEnabled: tempReminderEnabled,
      reminderTime: tempReminderTime
    };

    let newProfiles: WirdSettings[];
    if (settings) {
      newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    } else {
      newProfiles = [...allSettings, newWird];
    }

    saveAllSettings(newProfiles, newWird.id);
    setShowSettings(false);
    syncDailyWirdNotifications();
  };

  const handleAddNew = () => {
    setTempMode('days');
    setTempValue('30');
    setTempName('');
    setTempReminderEnabled(true);
    setTempReminderTime('09:00');
    setActiveId(null);
    setShowSettings(true);
  };

  const handleEditProfile = (profile: WirdSettings, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveId(profile.id);
    setTempMode(profile.mode);
    setTempValue(profile.value.toString());
    setTempName(profile.name);
    setTempReminderEnabled(profile.reminderEnabled !== false);
    setTempReminderTime(profile.reminderTime || '09:00');
    setShowSettings(true);
    setShowProfileMenu(false);
  };

  const handleDeleteProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(id);
    setShowProfileMenu(false);
  };

  const confirmDeleteProfile = () => {
    if (!showDeleteConfirm) return;
    const newProfiles = allSettings.filter(p => p.id !== showDeleteConfirm);
    let newActiveId = activeId;
    if (activeId === showDeleteConfirm) {
      newActiveId = newProfiles.length > 0 ? newProfiles[0].id : null;
    }
    saveAllSettings(newProfiles, newActiveId);
    syncDailyWirdNotifications();
    if (newProfiles.length === 0) {
      setShowSettings(true);
    }
    setShowDeleteConfirm(null);
  };

  const handleEdit = () => {
    if (settings) {
      setTempMode(settings.mode);
      setTempValue(settings.value.toString());
      setTempName(settings.name);
      setTempReminderEnabled(settings.reminderEnabled !== false);
      setTempReminderTime(settings.reminderTime || '09:00');
      setShowSettings(true);
    }
  };

  const handleCancelEdit = () => {
    if (allSettings.length === 0) {
      onBack();
    } else if (!activeId) {
      setActiveId(allSettings[0].id);
    }
    setShowSettings(false);
  };

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = () => {
    if (settings) {
      const resetProfile: WirdSettings = {
        ...settings,
        currentDay: 1,
        completedDays: [],
        startPage: 1,
        isActive: true,
        reminderEnabled: tempReminderEnabled,
        reminderTime: tempReminderTime
      };
      const newProfiles = allSettings.map(p => p.id === settings.id ? resetProfile : p);
      saveAllSettings(newProfiles, settings.id);
      syncDailyWirdNotifications();
      
      setTempMode('days');
      setTempValue('30');
      setTempName(settings.name);
      setCalcMethod('remaining');
      setShowSettings(true);
    }
    setShowResetConfirm(false);
  };

  const handleStartNewWird = () => {
    if (settings) {
      const resetProfile: WirdSettings = {
        ...settings,
        currentDay: 1,
        completedDays: [],
        startPage: 1,
        isActive: true,
        reminderEnabled: tempReminderEnabled,
        reminderTime: tempReminderTime
      };
      const newProfiles = allSettings.map(p => p.id === settings.id ? resetProfile : p);
      saveAllSettings(newProfiles, settings.id);
      syncDailyWirdNotifications();
      
      setTempMode(settings.mode);
      setTempValue(settings.value.toString());
      setTempName(settings.name);
      setCalcMethod('remaining');
      setShowSettings(true);
    }
  };

  const markDayCompleted = () => {
    if (!settings) return;
    const newCompleted = [...settings.completedDays, settings.currentDay];
    const newWird: WirdSettings = {
      ...settings,
      completedDays: newCompleted,
      currentDay: settings.currentDay < getTotalDays() ? settings.currentDay + 1 : settings.currentDay,
      lastPage: undefined,
      lastAyah: undefined,
      lastCompletedDate: new Date().toISOString()
    };
    const newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    saveAllSettings(newProfiles, settings.id);
    syncDailyWirdNotifications();
  };

  const getTotalDays = () => {
    if (!settings) return 30;
    return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const getPagesPerDay = () => {
    if (!settings) return 20;
    return settings.mode === 'pages' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const handleOpenQuran = (
    page: number, 
    initialAyah?: { s: number; a: number }, 
    readingMode: 'mushaf' | 'translation' = 'mushaf'
  ) => {
    const targetPage = Math.max(1, page);
    onNavigate('quran', { 
      page: targetPage, 
      surah: initialAyah?.s, 
      ayah: initialAyah?.a, 
      isWird: true,
      readingMode
    });
  };

  const renderSettings = () => (
    <div className={`p-4 rounded-2xl shadow-lg border ${isEn ? 'text-left' : 'text-right'}`} style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', color: isDefaultTheme ? '#000000' : 'inherit' }}>
      <h2 className="text-xl font-bold mb-4 text-center">
        {settings ? (isEn ? 'Edit Khatma' : 'تعديل الختمة') : (isEn ? 'New Khatma Setup' : 'إعداد ختمة جديدة')}
      </h2>
      
      <div className="space-y-4">
        <div id="wird-name-container">
          <label className="block mb-2 font-semibold">
            {isEn ? 'User / Khatma Name:' : 'اسم المستخدم / الختمة:'}
          </label>
          <input 
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className={`w-full border rounded-xl p-3 ${isEn ? 'text-left' : 'text-right'} focus:outline-none`}
            style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}
            placeholder={isEn ? 'e.g. Ahmed, Ramadan Khatma...' : 'مثال: أحمد، ختمة رمضان...'}
          />
        </div>

        <div id="wird-mode-container">
          <label className="block mb-2 font-semibold">
            {isEn ? 'Khatma Method:' : 'طريقة الختمة:'}
          </label>
          <div className="flex gap-4">
            <button 
              onClick={() => setTempMode('days')}
              className={`flex-1 py-3 rounded-xl border transition-all ${tempMode === 'days' ? 'font-bold' : 'opacity-70'}`}
              style={{
                borderColor: cardBorderColor,
                borderWidth: tempMode === 'days' ? '2px' : '1.5px',
                borderStyle: 'solid',
                backgroundColor: tempMode === 'days' 
                  ? (isDefaultTheme ? '#00000010' : (isBlackTheme ? 'rgba(255,255,255,0.15)' : `${primaryColor}20`)) 
                  : (isDefaultTheme ? '#FFFFFF' : 'transparent'),
                color: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : (tempMode === 'days' ? primaryColor : theme.textColor))
              }}
            >
              {isEn ? 'By Days' : 'حسب الأيام'}
            </button>
            <button 
              onClick={() => setTempMode('pages')}
              className={`flex-1 py-3 rounded-xl border transition-all ${tempMode === 'pages' ? 'font-bold' : 'opacity-70'}`}
              style={{
                borderColor: cardBorderColor,
                borderWidth: tempMode === 'pages' ? '2px' : '1.5px',
                borderStyle: 'solid',
                backgroundColor: tempMode === 'pages' 
                  ? (isDefaultTheme ? '#00000010' : (isBlackTheme ? 'rgba(255,255,255,0.15)' : `${primaryColor}20`)) 
                  : (isDefaultTheme ? '#FFFFFF' : 'transparent'),
                color: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : (tempMode === 'pages' ? primaryColor : theme.textColor))
              }}
            >
              {isEn ? 'By Pages' : 'حسب الصفحات'}
            </button>
          </div>
        </div>

        <div id="wird-value-container">
          <label className="block mb-2 font-semibold">
            {tempMode === 'days' 
              ? (isEn ? 'Number of Days for Khatma:' : 'عدد الأيام للختمة:') 
              : (isEn ? 'Pages Per Day:' : 'عدد الصفحات يومياً:')}
          </label>
          <input 
            type="text"
            inputMode="numeric"
            value={tempValue}
            onFocus={() => {
              setIsInputFocused(true);
              setTempValue('');
            }}
            onBlur={() => setIsInputFocused(false)}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value);
              if (val === '' || /^\d*$/.test(val)) {
                setTempValue(val);
              }
            }}
            className="w-full border rounded-xl p-3 text-center text-xl font-bold focus:outline-none"
            style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}
            placeholder={tempMode === 'days' ? '30' : '20'}
          />
        </div>

        {settings && settings.completedDays.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: cardBorderColor }}>
            <label className={`block mb-3 font-bold text-sm ${isDefaultTheme ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isEn ? 'Remaining Calculation Method:' : 'طريقة احتساب المتبقي:'}
            </label>
            <div className="space-y-3">
              <button 
                onClick={() => setCalcMethod('remaining')}
                className={`w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-sm flex items-center justify-between border transition-all`}
                style={{
                  borderColor: cardBorderColor,
                  borderWidth: calcMethod === 'remaining' ? '2px' : '1.5px',
                  borderStyle: 'solid',
                  backgroundColor: calcMethod === 'remaining' 
                    ? (isDefaultTheme ? '#0000000D' : `${primaryColor}15`) 
                    : (isDefaultTheme ? '#FFFFFF' : 'transparent')
                }}
              >
                <span className={isDefaultTheme ? 'text-black font-semibold' : ''}>
                  {isEn ? 'New plan for remaining (Input number is for future)' : 'خطة جديدة للمتبقي (العدد المدخل هو للمستقبل)'}
                </span>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: cardBorderColor, backgroundColor: calcMethod === 'remaining' ? cardBorderColor : 'transparent' }} />
              </button>
              <button 
                onClick={() => setCalcMethod('total')}
                className={`w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-sm flex items-center justify-between border transition-all`}
                style={{
                  borderColor: cardBorderColor,
                  borderWidth: calcMethod === 'total' ? '2px' : '1.5px',
                  borderStyle: 'solid',
                  backgroundColor: calcMethod === 'total' 
                    ? (isDefaultTheme ? '#0000000D' : `${primaryColor}15`) 
                    : (isDefaultTheme ? '#FFFFFF' : 'transparent')
                }}
              >
                <span className={isDefaultTheme ? 'text-black font-semibold' : ''}>
                  {isEn ? 'Modify current plan (Input number is total)' : 'تعديل الخطة الحالية (العدد المدخل هو الإجمالي)'}
                </span>
                <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: cardBorderColor, backgroundColor: calcMethod === 'total' ? cardBorderColor : 'transparent' }} />
              </button>
            </div>
            <p className={`text-[10px] mt-2 opacity-60 leading-tight ${isEn ? 'text-left' : 'text-right'}`}>
              {isEn ? '* Will start from the page following your last read page.' : '* سيتم البدء من الصفحة التالية لآخر صفحة قرأتها.'}
            </p>
          </div>
        )}



        <div className="flex gap-3 mt-6" id="wird-start-container">
          <button 
            onClick={handleStart}
            className="flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors border shadow-md"
            style={{ 
              backgroundColor: isDefaultTheme ? '#FFFFFF' : primaryColor, 
              color: isDefaultTheme ? '#000000' : btnTextColor,
              borderColor: cardBorderColor,
              borderWidth: '1.5px',
              borderStyle: 'solid'
            }}
          >
            <Play size={24} />
            {settings ? (isEn ? 'Save' : 'حفظ') : (isEn ? 'Start Khatma' : 'ابدأ الختمة')}
          </button>
          {(settings || allSettings.length > 0) && (
            <button 
              onClick={handleCancelEdit}
              className="py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-colors border shadow-md"
              style={{
                backgroundColor: isDefaultTheme ? '#FFFFFF' : 'rgba(107, 114, 128, 0.2)',
                color: isDefaultTheme ? '#000000' : '#FFFFFF',
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
              }}
            >
              <X size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const getDayRange = (day: number) => {
    if (!settings) return { start: 1, end: 20 };
    
    const startPage = settings.startPage || 1;
    const pagesLeft = TOTAL_PAGES - startPage + 1;
    const offset = startPage - 1;

    if (settings.mode === 'days') {
      const totalDays = settings.value;
      const start = Math.floor(((day - 1) * pagesLeft) / totalDays) + 1 + offset;
      const end = Math.floor((day * pagesLeft) / totalDays) + offset;
      return { start, end: Math.max(start - 1, end) };
    } else {
      const pagesPerDay = settings.value;
      const start = (day - 1) * pagesPerDay + 1 + offset;
      const end = Math.min(day * pagesPerDay + offset, TOTAL_PAGES);
      return { start: Math.min(start, TOTAL_PAGES + 1), end };
    }
  };

  const renderProgress = () => {
    if (!settings) return null;
    const totalDays = getTotalDays();
    const progress = (settings.completedDays.length / totalDays) * 100;
    
    const { start: startPage, end: endPage } = getDayRange(settings.currentDay);
    const isCompleted = settings.completedDays.includes(settings.currentDay);
    const hasPages = startPage <= endPage && startPage <= TOTAL_PAGES;
    const canContinue = settings.lastPage && !isCompleted;

    return (
      <div className="space-y-4">
        {/* Progress Bar */}
        <div id="wird-progress-container" className="rounded-2xl p-4 shadow-lg border" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', color: isDefaultTheme ? '#000000' : 'inherit' }}>
          <div className="flex justify-between mb-1">
            <span className="font-bold text-sm">{isEn ? 'Completion Rate' : 'نسبة الإنجاز'}</span>
            <span className={`font-bold ${isDefaultTheme ? 'text-black' : (isBlackTheme ? 'text-white' : 'text-green-500 dark:text-green-400')} text-sm`}>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: isDefaultTheme ? '#f3f4f6' : (theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)') }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full ${isDefaultTheme ? 'bg-black' : (isBlackTheme ? 'bg-white' : 'bg-gradient-to-r from-green-500 to-emerald-400')}`}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-80">
            <span>{isEn ? `Day ${settings.currentDay} of ${totalDays}` : `اليوم ${settings.currentDay} من ${totalDays}`}</span>
            <span>{isEn ? `${settings.completedDays.length} completed days` : `${settings.completedDays.length} يوم مكتمل`}</span>
          </div>
        </div>

        {/* Current Wird */}
        <div id="wird-today-card" className="rounded-2xl p-4 shadow-lg border text-center" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid', color: isDefaultTheme ? '#000000' : 'inherit' }}>
          <div id="wird-today-container">
            <h3 className={`text-lg font-bold mb-3 ${isDefaultTheme ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>
              {isEn ? `Today's Wird (${settings.currentDay})` : `ورد اليوم (${settings.currentDay})`}
            </h3>
            
            <div className="flex justify-center items-center gap-3 mb-4">
              {hasPages ? (
                <>
                  <div className="p-3 rounded-xl flex-1 border" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <p className="text-xs opacity-80 mb-1">{isEn ? 'From Page' : 'من صفحة'}</p>
                    <p className="text-2xl font-bold">{startPage}</p>
                  </div>
                  <span className="text-xl opacity-50">-</span>
                  <div className="p-3 rounded-xl flex-1 border" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <p className="text-xs opacity-80 mb-1">{isEn ? 'To Page' : 'إلى صفحة'}</p>
                    <p className="text-2xl font-bold">{endPage}</p>
                  </div>
                </>
              ) : (
                <div className="p-3 rounded-xl flex-1 border" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)'), borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                  <p className="text-lg font-bold">{isEn ? 'You have completed all pages!' : 'لقد أكملت جميع الصفحات!'}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2" id="wird-actions-container">
            {hasPages && (
              isEn ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {/* Button 1: Open Mushaf */}
                  <button 
                    id="btn-wird-mushaf"
                    onClick={() => {
                      if (canContinue) {
                        handleOpenQuran(settings.lastPage!, settings.lastAyah, 'mushaf');
                      } else {
                        handleOpenQuran(startPage, undefined, 'mushaf');
                      }
                    }}
                    className="flex-1 py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md border cursor-pointer active:scale-98"
                    style={{ 
                      backgroundColor: isDefaultTheme ? '#FFFFFF' : primaryColor, 
                      color: isDefaultTheme ? '#000000' : btnTextColor, 
                      borderColor: cardBorderColor,
                      borderWidth: '1.5px',
                      borderStyle: 'solid'
                    }}
                  >
                    <BookOpen size={18} />
                    <span>
                      {canContinue 
                        ? `Continue in Mushaf (p. ${settings.lastPage})` 
                        : 'Read in Mushaf'}
                    </span>
                  </button>

                  {/* Button 2: Open Translation */}
                  <button 
                    id="btn-wird-translation"
                    onClick={() => {
                      if (canContinue) {
                        handleOpenQuran(settings.lastPage!, settings.lastAyah, 'translation');
                      } else {
                        handleOpenQuran(startPage, undefined, 'translation');
                      }
                    }}
                    className="flex-1 py-3 px-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md border cursor-pointer active:scale-98"
                    style={{ 
                      backgroundColor: isDefaultTheme ? '#F3F4F6' : (theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'), 
                      color: isDefaultTheme ? '#000000' : (theme.isDark ? '#FFFFFF' : primaryColor), 
                      borderColor: cardBorderColor,
                      borderWidth: '1.5px',
                      borderStyle: 'solid'
                    }}
                  >
                    <Languages size={18} />
                    <span>
                      {canContinue 
                        ? `Continue Translation (p. ${settings.lastPage})` 
                        : 'Read Translation'}
                    </span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (canContinue) {
                      handleOpenQuran(settings.lastPage!, settings.lastAyah, 'mushaf');
                    } else {
                      handleOpenQuran(startPage, undefined, 'mushaf');
                    }
                  }}
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md border cursor-pointer active:scale-98"
                  style={{ 
                    backgroundColor: isDefaultTheme ? '#FFFFFF' : primaryColor, 
                    color: isDefaultTheme ? '#000000' : btnTextColor, 
                    borderColor: cardBorderColor,
                    borderWidth: '1.5px',
                    borderStyle: 'solid'
                  }}
                >
                  <BookOpen size={20} />
                  {canContinue 
                    ? `تكملة الورد (صفحة ${settings.lastPage})` 
                    : 'افتح المصحف للقراءة'}
                </button>
              )
            )}

            {!isCompleted ? (
              <button 
                onClick={markDayCompleted}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md border"
                style={{ 
                  backgroundColor: isDefaultTheme ? '#FFFFFF' : secondaryColor, 
                  color: isDefaultTheme ? '#000000' : btnTextColor, 
                  borderColor: cardBorderColor,
                  borderWidth: '1.5px',
                  borderStyle: 'solid'
                }}
              >
                <CheckCircle size={20} />
                {isEn ? 'Read Completed' : 'تمت القراءة'}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div 
                  className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border shadow-sm"
                  style={{ 
                    backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${secondaryColor}20`), 
                    color: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : secondaryColor),
                    borderColor: cardBorderColor,
                    borderWidth: '1.5px',
                    borderStyle: 'solid'
                  }}
                >
                  <CheckCircle size={20} />
                  {isEn ? 'Completed Entire Wird' : 'انجزت الورد كاملا'}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleStartNewWird}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md border"
                    style={{ 
                      backgroundColor: isDefaultTheme ? '#FFFFFF' : primaryColor, 
                      color: isDefaultTheme ? '#000000' : btnTextColor, 
                      borderColor: cardBorderColor,
                      borderWidth: '1.5px',
                      borderStyle: 'solid'
                    }}
                  >
                    <Plus size={20} />
                    {isEn ? 'Start New Wird' : 'بداية ورد جديد'}
                  </button>
                  <button 
                    onClick={() => onNavigate('home')}
                    className="flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm"
                    style={{
                      backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#000000' : (isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${secondaryColor}10`)),
                      color: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : (isBlackAndWhite ? '#FFFFFF' : secondaryColor)),
                      borderColor: cardBorderColor,
                      borderWidth: '1.5px',
                      borderStyle: 'solid'
                    }}
                  >
                    <Home size={20} />
                    {isEn ? 'Home' : 'الرئيسية'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>



        <div className="flex gap-2">
          <button 
            id="wird-edit-btn"
            onClick={handleEdit}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm"
            style={{ 
              backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${primaryColor}10`), 
              color: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : primaryColor),
              borderColor: cardBorderColor,
              borderWidth: '1.5px',
              borderStyle: 'solid'
            }}
          >
            <Settings size={18} />
            {isEn ? 'Edit Khatma' : 'تعديل الختمة'}
          </button>
          <button 
            id="wird-reset-btn"
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm"
            style={{ 
              backgroundColor: isDefaultTheme ? '#FFFFFF' : (isBlackAndWhite ? 'rgba(255,255,255,0.1)' : '#ef444410'), 
              color: isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : '#ef4444'),
              borderColor: cardBorderColor,
              borderWidth: '1.5px',
              borderStyle: 'solid'
            }}
          >
            <RotateCcw size={18} />
            {isEn ? 'Reset' : 'إعادة تعيين'}
          </button>
        </div>
      </div>
    );
  };

  const renderProfileSelector = () => {
    if (allSettings.length === 0) return null;
    return (
      <div className="relative mb-3">
        <button 
          id="wird-profile-selector"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full p-4 rounded-2xl border flex items-center justify-between transition-all"
          style={{ 
            backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', 
            borderColor: cardBorderColor, 
            borderWidth: '1.5px',
            borderStyle: 'solid',
            color: isDefaultTheme ? '#000000' : 'inherit' 
          }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDefaultTheme ? 'bg-black/5 text-black' : (isBlackTheme ? 'bg-white text-black' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')}`}>
              <User size={20} />
            </div>
            <div className={isEn ? 'text-left' : 'text-right'}>
              <p className="text-xs opacity-60">{isEn ? 'Current User' : 'المستخدم الحالي'}</p>
              <p className="font-bold">{settings?.name || (isEn ? 'Select User' : 'اختر مستخدماً')}</p>
            </div>
          </div>
          <ChevronDown size={20} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>

        {showProfileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowProfileMenu(false)}
            />
            <div 
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isEn ? 'text-left' : 'text-right'}`}
              style={{ 
                backgroundColor: isDefaultTheme ? '#ffffff' : (theme.isDark ? '#1a1a1a' : '#ffffff'), 
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid',
                color: isDefaultTheme ? '#000000' : 'inherit'
              }}
            >
              {allSettings.map(profile => (
                <div 
                  key={profile.id}
                  onClick={() => {
                    setActiveId(profile.id);
                    setShowProfileMenu(false);
                  }}
                  className={`p-4 flex items-center justify-between border-b last:border-0 cursor-pointer transition-colors ${activeId === profile.id ? (isDefaultTheme ? 'bg-black/5' : (isBlackTheme ? 'bg-white/10' : 'bg-emerald-500/10')) : 'hover:bg-gray-500/5'}`}
                  style={{ borderColor: isDefaultTheme ? '#00000015' : theme.cardBorder }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <User size={18} className={activeId === profile.id ? (isDefaultTheme ? 'text-black' : (isBlackTheme ? 'text-white' : 'text-emerald-500')) : 'opacity-40'} />
                    <span className={activeId === profile.id ? (isDefaultTheme ? 'font-bold' : (`font-bold ${isBlackTheme ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`)) : ''}>{profile.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleEditProfile(profile, e)}
                      className={`p-2 rounded-lg transition-colors ${isDefaultTheme ? 'text-gray-600 hover:bg-black/5' : 'text-blue-500 hover:bg-blue-500/10'}`}
                      title={isEn ? 'Edit' : 'تعديل'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className={`p-2 rounded-lg transition-colors ${isDefaultTheme ? 'text-red-500 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                      title={isEn ? 'Delete' : 'حذف'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  handleAddNew();
                  setShowProfileMenu(false);
                }}
                className={`w-full p-4 flex items-center justify-center gap-2 font-bold transition-colors ${isDefaultTheme ? 'text-black hover:bg-black/5' : (isBlackTheme ? 'text-white hover:bg-white/10' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5')}`}
              >
                <Plus size={20} />
                {isEn ? 'Add New User' : 'إضافة مستخدم جديد'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  const renderDeleteConfirmModal = () => {
    if (!showDeleteConfirm) return null;
    const profileToDelete = allSettings.find(p => p.id === showDeleteConfirm);
    if (!profileToDelete) return null;

    const isWirdIncomplete = !profileToDelete.completedDays.includes(profileToDelete.currentDay);

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir={isEn ? 'ltr' : 'rtl'}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-sm p-8 rounded-[32px] shadow-2xl ${isEn ? 'text-left' : 'text-center'} border`}
          style={{ 
            backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--modal-bg)', 
            borderColor: cardBorderColor, 
            borderWidth: '1.5px',
            borderStyle: 'solid',
            color: isDefaultTheme ? '#000000' : 'var(--modal-text)' 
          }}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${isDefaultTheme ? 'bg-red-500/10 text-red-500' : 'bg-red-500/10 text-red-500'}`}>
            <Trash2 size={40} />
          </div>
          <h3 className="text-2xl font-black mb-3">
            {isEn ? 'Delete User?' : 'حذف المستخدم؟'}
          </h3>
          <p className={`mb-6 ${isDefaultTheme ? 'text-gray-600' : 'opacity-70'}`}>
            {isEn 
              ? `Are you sure you want to delete "${profileToDelete.name}"? This action cannot be undone.` 
              : `هل أنت متأكد من حذف "${profileToDelete.name}"؟ لا يمكن التراجع عن هذه الخطوة.`}
          </p>
          
          {isWirdIncomplete && (
            <div className={`p-3 mb-6 rounded-xl bg-amber-500/10 border text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center gap-2 ${isEn ? 'text-left' : 'text-right'}`}
              style={{
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
              }}
            >
              <span className="text-lg">⚠️</span>
              {isEn ? "Warning: Today's wird has not been completed for this user yet." : "تنبيه: لم يتم إكمال ورد اليوم لهذا المستخدم بعد."}
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={confirmDeleteProfile}
              className="flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 shadow-md border"
              style={{
                backgroundColor: '#ef4444',
                color: '#ffffff',
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
              }}
            >
              {isEn ? 'Confirm Delete' : 'تأكيد الحذف'}
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-4 rounded-2xl font-bold transition-all active:scale-95 border"
              style={{
                backgroundColor: isDefaultTheme ? '#FFFFFF' : 'rgba(107, 114, 128, 0.2)',
                color: isDefaultTheme ? '#000000' : 'inherit',
                borderColor: cardBorderColor,
                borderWidth: '1.5px',
                borderStyle: 'solid'
              }}
            >
              {isEn ? 'Cancel' : 'إلغاء'}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const handleHomeClick = () => {
    if (showDeleteConfirm) {
      setShowDeleteConfirm(null);
    } else if (showResetConfirm) {
      setShowResetConfirm(false);
    } else if (showProfileMenu) {
      setShowProfileMenu(false);
    } else if (showSettings && allSettings.length > 0) {
      setShowSettings(false);
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const interceptor = () => {
      if (showDeleteConfirm) {
        setShowDeleteConfirm(null);
        return true;
      }
      if (showResetConfirm) {
        setShowResetConfirm(false);
        return true;
      }
      if (showProfileMenu) {
        setShowProfileMenu(false);
        return true;
      }
      if (showSettings && allSettings.length > 0) {
        setShowSettings(false);
        return true;
      }
      return false;
    };

    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [showDeleteConfirm, showResetConfirm, showProfileMenu, showSettings, allSettings.length]);

  return (
    <div className="h-screen flex flex-col bg-transparent" dir={isEn ? 'ltr' : 'rtl'} style={{ fontFamily: theme.font, backgroundColor: isDefaultTheme ? '#FFFFFF' : 'transparent', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}>
      <header className="app-top-bar">
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-center w-full min-h-[44px]">
            {/* Back button & Notification toggle button */}
            <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1.5`}>
              <button
                onClick={handleHomeClick}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? 'Go Back' : 'رجوع للخلف'}
                aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
              >
                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
              {!showSettings && settings && (
                <button
                  id="wird-notifications-toggle-btn"
                  type="button"
                  onClick={() => {
                    if (!settings) return;
                    const next = settings.reminderEnabled === false;
                    const updated = {
                      ...settings,
                      reminderEnabled: next,
                      reminderTime: settings.reminderTime || '09:00'
                    };
                    const newProfiles = allSettings.map(p => p.id === settings.id ? updated : p);
                    saveAllSettings(newProfiles, settings.id);
                    syncDailyWirdNotifications(language);
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      try { navigator.vibrate(30); } catch {}
                    }
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={
                    isEn 
                      ? (settings?.reminderEnabled !== false ? 'Daily Wird Notifications: Enabled (Click to disable)' : 'Daily Wird Notifications: Disabled (Click to enable)') 
                      : (settings?.reminderEnabled !== false ? 'تنبيهات الورد اليومي: مفعّل (اضغط للتعطيل)' : 'تنبيهات الورد اليومي: معطّل (اضغط للتفعيل)')
                  }
                  aria-label={
                    isEn 
                      ? (settings?.reminderEnabled !== false ? 'Daily Wird Notifications: Enabled' : 'Daily Wird Notifications: Disabled') 
                      : (settings?.reminderEnabled !== false ? 'تنبيهات الورد اليومي: مفعّل' : 'تنبيهات الورد اليومي: معطّل')
                  }
                >
                  <div className={`w-[19px] h-[19px] rounded-full border-[1.5px] border-white/90 dark:border-white/80 shadow-xs transition-all duration-300 flex items-center justify-center ${
                    settings?.reminderEnabled !== false 
                      ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-emerald-400 text-white shadow-emerald-500/30 ring-1.5 ring-emerald-500/25' 
                      : 'bg-gradient-to-tr from-red-600 via-red-500 to-rose-400 text-white shadow-red-500/30 ring-1.5 ring-red-500/25'
                  }`}>
                    {settings?.reminderEnabled !== false ? (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    ) : (
                      <span className="w-1.5 h-0.5 bg-white/95 rounded-full" />
                    )}
                  </div>
                </button>
              )}
            </div>

            {/* Title in center */}
            <div className="text-center px-12 min-w-0">
              <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                {isEn ? 'Daily Wird' : 'الورد اليومي'}
              </h1>
            </div>

            {/* Home / Page Lock / Guide icons */}
            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
              <button
                type="button"
                onClick={handleOpenGuide}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                style={{ color: 'var(--top-bar-text, inherit)' }}
                title={isEn ? "Daily Wird Guide" : "دليل الورد اليومي"}
                aria-label={isEn ? "Daily Wird Guide" : "دليل الورد اليومي"}
              >
                <HelpCircle size={19} />
              </button>
              <ThemePageLock />
              <button
                onClick={() => onNavigate('home')}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? 'Home Page' : 'الصفحة الرئيسية'}
                aria-label={isEn ? 'Home Page' : 'الصفحة الرئيسية'}
              >
                <i className="fa-solid fa-house text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-6 flex flex-col items-center justify-start">
        <div className="w-full max-w-md pb-6">
          {!showSettings && renderProfileSelector()}
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
        <div className="shrink-0 w-full h-4"></div>
      </main>

      {renderDeleteConfirmModal()}

      <ResetConfirmModal 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
      />

      <CommunitySpotlightGuide
        guideKey="daily_wird_settings_tour"
        steps={DAILY_SETTINGS_STEPS}
        isOpen={showSettingsTour}
        onClose={() => setShowSettingsTour(false)}
        isEn={isEn}
      />

      <CommunitySpotlightGuide
        guideKey="daily_wird_progress_tour"
        steps={DAILY_PROGRESS_STEPS}
        isOpen={showProgressTour}
        onClose={() => setShowProgressTour(false)}
        isEn={isEn}
      />
    </div>
  );
};

export default DailyWird;
