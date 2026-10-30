import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';
import { CheckCircle, BookOpen, RotateCcw, Play, Settings, X, User, Plus, Trash2, ChevronDown, Edit2, Home, Check, Languages } from 'lucide-react';
import ThemePageLock from '../components/ThemePageLock';
import ResetConfirmModal from '../components/DailyWird/ResetConfirmModal';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { DAILY_SETTINGS_STEPS, DAILY_PROGRESS_STEPS } from '../components/Community/communityTourSteps';
import { syncDailyWirdNotifications } from '../utils/dailyWirdNotificationService';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

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

// Utility to convert hex colors to rgba for soft tinted badges and highlights
function hexToRgba(hex: string, alpha: number = 1): string {
  if (!hex) return `rgba(46, 125, 94, ${alpha})`;
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'أبيض وأسود';
  
  // Dynamic Theme Colors
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#2E7D5E')));
  const secondaryColor = isBlackTheme ? '#A1A1AA' : (theme.palette?.[1] || theme.palette?.[0] || '#4B5563');
  const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';

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
      let wasSanitized = false;
      const profiles = (parsed.profiles || []).map((p: any) => {
        let sanitizedStartPage = p.startPage || 1;
        // Fix corrupted startPage where startPage was mistakenly set to 21 or lastPageRead + 1
        // during an edit while completedDays contains day 1 or currentDay > 1
        if (sanitizedStartPage > 1 && (p.completedDays?.includes(1) || p.currentDay > 1)) {
          sanitizedStartPage = 1;
          wasSanitized = true;
        }
        return {
          ...p,
          startPage: sanitizedStartPage,
          reminderEnabled: p.reminderEnabled !== false
        };
      });
      const activeProfileId = parsed.activeId || (profiles.length > 0 ? profiles[0].id : null);
      
      setAllSettings(profiles);
      setActiveId(activeProfileId);

      if (wasSanitized) {
        const dataStr = JSON.stringify({ profiles, activeId: activeProfileId });
        localStorage.setItem('dailyWirdSettings_v2', dataStr);
        try {
          Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr });
        } catch (e) {}
      }

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
              setCalcMethod('total');
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
          name: 'المستخدم 1',
          startPage: 1
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
    const dataStr = JSON.stringify({ profiles, activeId: activeProfileId });
    localStorage.setItem('dailyWirdSettings_v2', dataStr);
    try {
      Preferences.set({ key: 'dailyWirdSettings_v2', value: dataStr });
    } catch (e) {}
  };

  useEffect(() => {
    if (settings) {
      setTempReminderEnabled(settings.reminderEnabled !== false);
      setTempReminderTime(settings.reminderTime || '09:00');
    }
  }, [settings]);

  const handleStart = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await LocalNotifications.requestPermissions();
      } catch (e) {}
    }

    const inputVal = parseInt(tempValue) || (tempMode === 'days' ? 30 : 20);
    let finalValue = inputVal;
    let startPage = 1;
    let currentDay = settings ? settings.currentDay : 1;
    let completedDays = settings ? settings.completedDays : [];
    const profileName = tempName.trim() || (isEn ? `User ${allSettings.length + 1}` : `مستخدم ${allSettings.length + 1}`);

    if (settings && settings.completedDays.length > 0) {
      if (calcMethod === 'remaining') {
        const lastPageRead = Math.max(0, ...settings.completedDays.map(d => getDayRange(d).end));
        startPage = lastPageRead + 1;
        currentDay = 1;
        completedDays = [];
        finalValue = inputVal;
      } else {
        // 'total': Keep existing Khatma startPage and retain days progress
        startPage = settings.startPage || 1;
        finalValue = inputVal;
      }
    } else if (settings) {
      startPage = settings.startPage || 1;
    }

    const newWird: WirdSettings = {
      id: settings?.id || Date.now().toString(),
      name: profileName,
      mode: tempMode,
      value: finalValue,
      startDate: settings ? settings.startDate : new Date().toISOString(),
      currentDay: currentDay,
      completedDays: completedDays,
      isActive: true,
      startPage: startPage,
      lastPage: settings?.lastPage,
      lastAyah: settings?.lastAyah,
      reminderEnabled: tempReminderEnabled,
      reminderTime: tempReminderTime,
      lastCompletedDate: settings?.lastCompletedDate
    };

    let newProfiles: WirdSettings[];
    if (settings) {
      newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    } else {
      newProfiles = [...allSettings, newWird];
    }

    saveAllSettings(newProfiles, newWird.id);
    setShowSettings(false);
    await syncDailyWirdNotifications(language);
  };

  const handleAddNew = () => {
    setTempMode('days');
    setTempValue('30');
    setTempName('');
    setTempReminderEnabled(true);
    setTempReminderTime('09:00');
    setCalcMethod('total');
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
    setCalcMethod('total');
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
    syncDailyWirdNotifications(language);
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
      setCalcMethod('total');
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
      syncDailyWirdNotifications(language);
      
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
      syncDailyWirdNotifications(language);
      
      setTempMode(settings.mode);
      setTempValue(settings.value.toString());
      setTempName(settings.name);
      setCalcMethod('remaining');
      setShowSettings(true);
    }
  };

  const markDayCompleted = async () => {
    if (!settings) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const newCompleted = [...settings.completedDays, settings.currentDay];
    const newWird: WirdSettings = {
      ...settings,
      completedDays: newCompleted,
      currentDay: settings.currentDay < getTotalDays() ? settings.currentDay + 1 : settings.currentDay,
      lastPage: undefined,
      lastAyah: undefined,
      lastCompletedDate: todayStr
    };
    const newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    saveAllSettings(newProfiles, settings.id);
    await syncDailyWirdNotifications(language);
  };

  const getTotalDays = () => {
    if (!settings) return 30;
    return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
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

  // Modern Flat Settings Screen
  const renderSettings = () => (
    <div 
      className={`p-5 rounded-3xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0 ${isEn ? 'text-left' : 'text-right'}`} 
      style={{ color: 'var(--text-color)' }}
    >
      <h2 className="text-xl font-bold mb-4 text-center font-kufi" style={{ color: primaryColor }}>
        {settings ? (isEn ? 'Edit Khatma Plan' : 'تعديل خطة الختمة') : (isEn ? 'New Khatma Setup' : 'إعداد ختمة جديدة')}
      </h2>
      
      <div className="space-y-4">
        {/* Profile Name */}
        <div id="wird-name-container" className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 px-1">
            {isEn ? 'Khatma / User Name:' : 'اسم الختمة / المستخدم:'}
          </label>
          <input 
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className={`w-full bg-slate-100 dark:bg-zinc-800/80 rounded-2xl p-3.5 ${isEn ? 'text-left' : 'text-right'} font-semibold text-sm border-0 focus:outline-none focus:ring-2 transition-all`}
            style={{ 
              color: 'var(--text-color)'
            }}
            placeholder={isEn ? 'e.g. Ahmed, Ramadan Khatma...' : 'مثال: أحمد، ختمة رمضان...'}
          />
        </div>

        {/* Khatma Method Segmented Chips */}
        <div id="wird-mode-container" className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 px-1">
            {isEn ? 'Khatma Method:' : 'طريقة الختمة:'}
          </label>
          <div className="flex bg-slate-200/60 dark:bg-zinc-800/60 p-1.5 rounded-2xl gap-1.5 border-0">
            <button 
              type="button"
              onClick={() => setTempMode('days')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border-0 ${
                tempMode === 'days' 
                  ? 'shadow-sm text-white' 
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
              style={{
                backgroundColor: tempMode === 'days' ? primaryColor : 'transparent',
                color: tempMode === 'days' ? btnTextColor : undefined
              }}
            >
              {isEn ? 'By Days' : 'حسب الأيام'}
            </button>
            <button 
              type="button"
              onClick={() => setTempMode('pages')}
              className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer border-0 ${
                tempMode === 'pages' 
                  ? 'shadow-sm text-white' 
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
              style={{
                backgroundColor: tempMode === 'pages' ? primaryColor : 'transparent',
                color: tempMode === 'pages' ? btnTextColor : undefined
              }}
            >
              {isEn ? 'By Pages' : 'حسب الصفحات'}
            </button>
          </div>
        </div>

        {/* Number of Days or Pages */}
        <div id="wird-value-container" className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 dark:text-zinc-300 px-1">
            {tempMode === 'days' 
              ? (isEn ? 'Target Number of Days:' : 'عدد الأيام المستهدفة للختمة:') 
              : (isEn ? 'Pages to Read Daily:' : 'عدد الصفحات للقراءة يومياً:')}
          </label>
          <input 
            type="text"
            inputMode="numeric"
            value={tempValue}
            onFocus={() => {
              setTempValue('');
            }}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value);
              if (val === '' || /^\d*$/.test(val)) {
                setTempValue(val);
              }
            }}
            className="w-full bg-slate-100 dark:bg-zinc-800/80 rounded-2xl p-3.5 text-center text-2xl font-black border-0 focus:outline-none focus:ring-2 transition-all"
            style={{ color: primaryColor }}
            placeholder={tempMode === 'days' ? '30' : '20'}
          />
        </div>

        {/* Calculation method for remaining */}
        {settings && settings.completedDays.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 space-y-2 border-0">
            <label className="block font-bold text-xs" style={{ color: primaryColor }}>
              {isEn ? 'Remaining Calculation Method:' : 'طريقة احتساب المتبقي:'}
            </label>
            <div className="space-y-2">
              <button 
                type="button"
                onClick={() => setCalcMethod('remaining')}
                className={`w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-xs font-bold flex items-center justify-between transition-all cursor-pointer border-0 ${
                  calcMethod === 'remaining' 
                    ? 'bg-white dark:bg-zinc-900 shadow-sm' 
                    : 'bg-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ color: calcMethod === 'remaining' ? primaryColor : 'var(--text-color)' }}
              >
                <span>
                  {isEn ? 'New plan for remaining (Input is future days)' : 'خطة جديدة للمتبقي (العدد المدخل هو للمستقبل)'}
                </span>
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2" 
                  style={{ 
                    borderColor: calcMethod === 'remaining' ? primaryColor : '#94A3B8',
                    backgroundColor: calcMethod === 'remaining' ? primaryColor : 'transparent' 
                  }}
                >
                  {calcMethod === 'remaining' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setCalcMethod('total')}
                className={`w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-xs font-bold flex items-center justify-between transition-all cursor-pointer border-0 ${
                  calcMethod === 'total' 
                    ? 'bg-white dark:bg-zinc-900 shadow-sm' 
                    : 'bg-transparent opacity-70 hover:opacity-100'
                }`}
                style={{ color: calcMethod === 'total' ? primaryColor : 'var(--text-color)' }}
              >
                <span>
                  {isEn ? 'Modify current plan (Input is total)' : 'تعديل الخطة الحالية (العدد المدخل هو الإجمالي)'}
                </span>
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 border-2" 
                  style={{ 
                    borderColor: calcMethod === 'total' ? primaryColor : '#94A3B8',
                    backgroundColor: calcMethod === 'total' ? primaryColor : 'transparent' 
                  }}
                >
                  {calcMethod === 'total' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            </div>
            <p className="text-[10px] opacity-60 leading-tight pt-1">
              {isEn ? '* Will continue from the page following your last read page.' : '* سيتم البدء من الصفحة التالية لآخر صفحة قرأتها.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3" id="wird-start-container">
          <button 
            type="button"
            onClick={handleStart}
            className="flex-1 py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg border-0 cursor-pointer"
            style={{ 
              backgroundColor: primaryColor, 
              color: btnTextColor,
              boxShadow: `0 10px 25px -5px ${hexToRgba(primaryColor, 0.4)}`
            }}
          >
            <Play size={20} fill="currentColor" />
            <span>{settings ? (isEn ? 'Save Plan' : 'حفظ الخطة') : (isEn ? 'Start Khatma' : 'ابدأ الختمة')}</span>
          </button>
          
          {(settings || allSettings.length > 0) && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className="py-4 px-5 rounded-2xl font-bold text-base flex items-center justify-center transition-all active:scale-[0.98] bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border-0 cursor-pointer"
              style={{ color: 'var(--text-color)' }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // Modern Flat Progress Screen
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
        {/* Progress Card */}
        <div 
          id="wird-progress-container" 
          className="rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0 space-y-3"
          style={{ color: 'var(--text-color)' }}
        >
          <div className="flex justify-between items-center">
            <span className="font-bold text-sm text-slate-800 dark:text-zinc-200">
              {isEn ? 'Completion Rate' : 'نسبة الإنجاز'}
            </span>
            <span className="font-black text-base" style={{ color: primaryColor }}>
              {progress.toFixed(1)}%
            </span>
          </div>

          {/* Thick Rounded Progress Bar */}
          <div className="w-full h-3.5 rounded-full overflow-hidden bg-slate-100 dark:bg-zinc-800 p-0.5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full rounded-full transition-all"
              style={{ backgroundColor: primaryColor }}
            />
          </div>

          <div className="flex justify-between items-center text-xs opacity-70 font-semibold pt-0.5">
            <span>{isEn ? `Day ${settings.currentDay} of ${totalDays}` : `اليوم ${settings.currentDay} من ${totalDays}`}</span>
            <span>{isEn ? `${settings.completedDays.length} days done` : `${settings.completedDays.length} يوم مكتمل`}</span>
          </div>
        </div>

        {/* Current Day's Reading Card */}
        <div 
          id="wird-today-card" 
          className="rounded-3xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.03)] bg-white dark:bg-zinc-900 border-0 text-center space-y-4"
          style={{ color: 'var(--text-color)' }}
        >
          <div id="wird-today-container">
            <div className="flex items-center justify-center gap-2 mb-3">
              <BookOpen size={18} style={{ color: primaryColor }} />
              <h3 className="text-base font-bold" style={{ color: primaryColor }}>
                {isEn ? `Today's Assigned Wird (${settings.currentDay})` : `ورد اليوم (${settings.currentDay})`}
              </h3>
            </div>
            
            <div className="flex justify-center items-center gap-3">
              {hasPages ? (
                <>
                  <div className="p-3.5 rounded-2xl flex-1 bg-slate-100 dark:bg-zinc-800/80 border-0">
                    <p className="text-[11px] opacity-70 mb-0.5 font-semibold">{isEn ? 'From Page' : 'من صفحة'}</p>
                    <p className="text-2xl font-black" style={{ color: primaryColor }}>{startPage}</p>
                  </div>
                  <span className="text-xl opacity-30 font-bold">-</span>
                  <div className="p-3.5 rounded-2xl flex-1 bg-slate-100 dark:bg-zinc-800/80 border-0">
                    <p className="text-[11px] opacity-70 mb-0.5 font-semibold">{isEn ? 'To Page' : 'إلى صفحة'}</p>
                    <p className="text-2xl font-black" style={{ color: primaryColor }}>{endPage}</p>
                  </div>
                </>
              ) : (
                <div className="p-4 rounded-2xl flex-1 bg-slate-100 dark:bg-zinc-800/80 border-0">
                  <p className="text-base font-bold" style={{ color: primaryColor }}>
                    {isEn ? 'You have completed all pages!' : 'لقد أكملت جميع الصفحات بارك الله فيك!'}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 pt-1" id="wird-actions-container">
            {hasPages && (
              isEn ? (
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  {/* Button 1: Open Mushaf */}
                  <button 
                    id="btn-wird-mushaf"
                    type="button"
                    onClick={() => {
                      if (canContinue) {
                        handleOpenQuran(settings.lastPage!, settings.lastAyah, 'mushaf');
                      } else {
                        handleOpenQuran(startPage, undefined, 'mushaf');
                      }
                    }}
                    className="flex-1 py-3.5 px-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-md border-0 cursor-pointer active:scale-98"
                    style={{ 
                      backgroundColor: primaryColor, 
                      color: btnTextColor,
                      boxShadow: `0 8px 20px -4px ${hexToRgba(primaryColor, 0.35)}`
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
                    type="button"
                    onClick={() => {
                      if (canContinue) {
                        handleOpenQuran(settings.lastPage!, settings.lastAyah, 'translation');
                      } else {
                        handleOpenQuran(startPage, undefined, 'translation');
                      }
                    }}
                    className="flex-1 py-3.5 px-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-sm bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border-0 cursor-pointer active:scale-98"
                    style={{ color: 'var(--text-color)' }}
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
                  type="button"
                  onClick={() => {
                    if (canContinue) {
                      handleOpenQuran(settings.lastPage!, settings.lastAyah, 'mushaf');
                    } else {
                      handleOpenQuran(startPage, undefined, 'mushaf');
                    }
                  }}
                  className="w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2.5 transition-all text-base shadow-md border-0 cursor-pointer active:scale-98"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: btnTextColor,
                    boxShadow: `0 10px 25px -5px ${hexToRgba(primaryColor, 0.4)}`
                  }}
                >
                  <BookOpen size={20} />
                  <span>
                    {canContinue 
                      ? `تكملة الورد (صفحة ${settings.lastPage})` 
                      : 'افتح المصحف للقراءة'}
                  </span>
                </button>
              )
            )}

            {!isCompleted ? (
              <button 
                type="button"
                onClick={markDayCompleted}
                className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-sm shadow-sm border-0 cursor-pointer active:scale-98"
                style={{ 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor
                }}
              >
                <CheckCircle size={18} />
                <span>{isEn ? 'Mark Day as Completed' : 'تمت قراءة ورد اليوم'}</span>
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div 
                  className="w-full py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 text-sm border-0"
                  style={{ 
                    backgroundColor: hexToRgba(primaryColor, 0.14), 
                    color: primaryColor
                  }}
                >
                  <CheckCircle size={18} />
                  <span>{isEn ? 'Completed Today\'s Wird' : 'أنجزت الورد كاملاً لهذا اليوم'}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={handleStartNewWird}
                    className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs shadow-md border-0 cursor-pointer"
                    style={{ 
                      backgroundColor: primaryColor, 
                      color: btnTextColor 
                    }}
                  >
                    <Plus size={16} />
                    <span>{isEn ? 'Start New Wird' : 'بداية ورد جديد'}</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => onNavigate('home')}
                    className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border-0 cursor-pointer"
                    style={{ color: 'var(--text-color)' }}
                  >
                    <Home size={16} />
                    <span>{isEn ? 'Home' : 'الرئيسية'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2.5">
          <button 
            id="wird-edit-btn"
            type="button"
            onClick={handleEdit}
            className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md border-0 cursor-pointer"
            style={{ color: primaryColor }}
          >
            <Settings size={16} />
            <span>{isEn ? 'Edit Khatma' : 'تعديل الختمة'}</span>
          </button>
          
          <button 
            id="wird-reset-btn"
            type="button"
            onClick={handleReset}
            className="flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs bg-white dark:bg-zinc-900 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md border-0 cursor-pointer text-red-500 hover:text-red-600"
          >
            <RotateCcw size={16} />
            <span>{isEn ? 'Reset' : 'إعادة تعيين'}</span>
          </button>
        </div>
      </div>
    );
  };

  // Modern Flat Profile Selector
  const renderProfileSelector = () => {
    if (allSettings.length === 0) return null;
    return (
      <div className="relative mb-3.5">
        <button 
          id="wird-profile-selector"
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full p-4 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-md flex items-center justify-between transition-all bg-white dark:bg-zinc-900 border-0 cursor-pointer"
          style={{ color: 'var(--text-color)' }}
        >
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: hexToRgba(primaryColor, 0.12), color: primaryColor }}
            >
              <User size={20} />
            </div>
            <div className={isEn ? 'text-left' : 'text-right'}>
              <p className="text-[11px] opacity-60 font-semibold">{isEn ? 'Current User' : 'المستخدم الحالي'}</p>
              <p className="font-bold text-sm">{settings?.name || (isEn ? 'Select User' : 'اختر مستخدماً')}</p>
            </div>
          </div>
          <ChevronDown size={18} className={`transition-transform opacity-60 ${showProfileMenu ? 'rotate-180' : ''}`} />
        </button>

        {showProfileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowProfileMenu(false)}
            />
            <div 
              className={`absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 bg-white dark:bg-zinc-900 border-0 ${isEn ? 'text-left' : 'text-right'}`}
              style={{ color: 'var(--text-color)' }}
            >
              {allSettings.map(profile => (
                <div 
                  key={profile.id}
                  onClick={() => {
                    setActiveId(profile.id);
                    setShowProfileMenu(false);
                  }}
                  className={`p-4 flex items-center justify-between cursor-pointer transition-colors ${
                    activeId === profile.id 
                      ? 'bg-slate-100/80 dark:bg-zinc-800/80 font-bold' 
                      : 'hover:bg-slate-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <User 
                      size={18} 
                      className={activeId === profile.id ? '' : 'opacity-40'}
                      style={activeId === profile.id ? { color: primaryColor } : {}}
                    />
                    <span style={activeId === profile.id ? { color: primaryColor } : {}}>
                      {profile.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={(e) => handleEditProfile(profile, e)}
                      className="p-2 rounded-xl text-slate-500 hover:bg-slate-200/60 dark:hover:bg-zinc-700 transition-colors border-0 cursor-pointer"
                      title={isEn ? 'Edit' : 'تعديل'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-0 cursor-pointer"
                      title={isEn ? 'Delete' : 'حذف'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <button 
                type="button"
                onClick={() => {
                  handleAddNew();
                  setShowProfileMenu(false);
                }}
                className="w-full p-4 flex items-center justify-center gap-2 font-bold text-sm transition-colors hover:bg-slate-50 dark:hover:bg-zinc-800/40 border-0 cursor-pointer"
                style={{ color: primaryColor }}
              >
                <Plus size={18} />
                <span>{isEn ? 'Add New User' : 'إضافة مستخدم جديد'}</span>
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
          className={`w-full max-w-sm p-6 rounded-3xl shadow-2xl ${isEn ? 'text-left' : 'text-center'} bg-white dark:bg-zinc-900 border-0`}
          style={{ color: 'var(--text-color)' }}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/10 text-red-500">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">
            {isEn ? 'Delete User?' : 'حذف المستخدم؟'}
          </h3>
          <p className="mb-4 text-xs opacity-70 leading-relaxed">
            {isEn 
              ? `Are you sure you want to delete "${profileToDelete.name}"? This action cannot be undone.` 
              : `هل أنت متأكد من حذف "${profileToDelete.name}"؟ لا يمكن التراجع عن هذه الخطوة.`}
          </p>
          
          {isWirdIncomplete && (
            <div className="p-3 mb-5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2 border-0">
              <span className="text-base">⚠️</span>
              <span>{isEn ? "Warning: Today's wird has not been completed for this user yet." : "تنبيه: لم يتم إكمال ورد اليوم لهذا المستخدم بعد."}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button 
              type="button"
              onClick={confirmDeleteProfile}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-md bg-red-500 text-white border-0 cursor-pointer"
            >
              {isEn ? 'Confirm Delete' : 'تأكيد الحذف'}
            </button>
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 border-0 cursor-pointer"
              style={{ color: 'var(--text-color)' }}
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
    <div 
      className="h-screen flex flex-col" 
      dir={isEn ? 'ltr' : 'rtl'} 
      style={{ 
        fontFamily: theme.font, 
        backgroundColor: theme.bgColor || '#F8FAFC', 
        color: 'var(--text-color)' 
      }}
    >
      <header className="app-top-bar shrink-0 relative z-10" style={{ backgroundColor: 'var(--qr-bar-bg)', borderBottom: '1px solid var(--qr-bar-border)' }}>
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
              <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate" style={{ color: 'var(--qr-bar-text)' }}>
                {isEn ? 'Daily Wird' : 'الورد اليومي'}
              </h1>
            </div>

            {/* Home / Page Lock / Guide icons */}
            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
              <button
                type="button"
                onClick={handleOpenGuide}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                style={{ color: 'var(--qr-bar-text, var(--top-bar-text, inherit))' }}
                title={isEn ? "Daily Wird Guide" : "دليل الورد اليومي"}
                aria-label={isEn ? "Daily Wird Guide" : "دليل الورد اليومي"}
              >
                <i className="fa-solid fa-circle-question text-lg"></i>
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
        <div className="w-full max-w-md pb-6 space-y-3">
          {!showSettings && renderProfileSelector()}
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
        <div className="shrink-0 w-full h-6"></div>
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
