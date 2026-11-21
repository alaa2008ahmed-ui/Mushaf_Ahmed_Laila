import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CheckCircle, RotateCcw, Play, Settings, X, User, Plus, Trash2, ChevronDown, Edit2, Home, Check } from 'lucide-react';
import ResetConfirmModal from '../components/DailyWird/ResetConfirmModal';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { DAILY_SETTINGS_STEPS, DAILY_PROGRESS_STEPS } from '../components/Community/communityTourSteps';
import { useShowPageGuides } from '../utils/guideManager';
import { syncDailyWirdNotifications, getWirdDayRange } from '../utils/dailyWirdNotificationService';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { Preferences } from '@capacitor/preferences';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { SURAH_NAMES_AR, SURAH_NAMES_EN, toArabic } from '../components/QuranReader/constants';
import quranMetadata from '../data/quran-metadata.json';

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
  reminderTime?: string; // e.g. "10:00"
  lastCompletedDate?: string;
}

const TOTAL_PAGES = 604;

export interface WirdAyahInfo {
  surahNumber: number;
  surahNameAr: string;
  surahNameEn: string;
  ayahNumber: number;
  juzNumber: number;
  pageNumber: number;
}

export function getAyahDetails(page: number, ayahRef?: { s: number; a: number }): WirdAyahInfo {
  const targetPage = Math.max(1, Math.min(TOTAL_PAGES, page));
  if (ayahRef && ayahRef.s >= 1 && ayahRef.s <= 114) {
    const surah = quranMetadata.surahs[ayahRef.s - 1];
    if (surah) {
      const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === ayahRef.a) || surah.ayahs[0];
      return {
        surahNumber: ayahRef.s,
        surahNameAr: SURAH_NAMES_AR[ayahRef.s - 1] || surah.name,
        surahNameEn: SURAH_NAMES_EN[ayahRef.s - 1] || surah.englishName,
        ayahNumber: ayah?.numberInSurah || ayahRef.a || 1,
        juzNumber: ayah?.juz || 1,
        pageNumber: ayah?.page || targetPage
      };
    }
  }

  // If no specific ayah provided, find the first ayah on the page
  for (const surah of quranMetadata.surahs) {
    const ayah = surah.ayahs.find((ay: any) => ay.page === targetPage);
    if (ayah) {
      return {
        surahNumber: surah.number,
        surahNameAr: SURAH_NAMES_AR[surah.number - 1] || surah.name,
        surahNameEn: SURAH_NAMES_EN[surah.number - 1] || surah.englishName,
        ayahNumber: ayah.numberInSurah,
        juzNumber: ayah.juz,
        pageNumber: targetPage
      };
    }
  }

  return {
    surahNumber: 1,
    surahNameAr: SURAH_NAMES_AR[0],
    surahNameEn: SURAH_NAMES_EN[0],
    ayahNumber: 1,
    juzNumber: 1,
    pageNumber: targetPage
  };
}

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

// Arabic ordinal adjective matching masculine genitive «اليومِ» (e.g. الأول، الثاني، ... العشرين، الثلاثين)
function getArabicDayOrdinal(day: number): string {
  const n = Math.max(1, Math.floor(day));
  const units = [
    '', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع', 'العاشر'
  ];
  const teens = [
    '', 'الحادي عشر', 'الثاني عشر', 'الثالث عشر', 'الرابع عشر', 'الخامس عشر',
    'السادس عشر', 'السابع عشر', 'الثامن عشر', 'التاسع عشر'
  ];
  const decades = [
    '', '', 'العشرين', 'الثلاثين', 'الأربعين', 'الخمسين',
    'الستين', 'السبعين', 'الثمانين', 'التسعين'
  ];
  const compoundUnits = [
    '', 'الحادي', 'الثاني', 'الثالث', 'الرابع', 'الخامس',
    'السادس', 'السابع', 'الثامن', 'التاسع'
  ];
  const hundreds = [
    '', 'المئة', 'المئتين', 'الثلاثمئة', 'الأربعمئة', 'الخمسمئة',
    'الستمئة', 'السبعمئة', 'الثمانمئة', 'التسعمئة'
  ];

  if (n <= 10) return units[n];
  if (n <= 19) return teens[n - 10];
  if (n < 100) {
    const u = n % 10;
    const d = Math.floor(n / 10);
    if (u === 0) return decades[d];
    return `${compoundUnits[u]} و${decades[d]}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    if (rem === 0) return hundreds[h];
    return `${hundreds[h]} و${getArabicDayOrdinal(rem)}`;
  }
  return toArabic(n);
}

function getEnglishOrdinal(day: number): string {
  const n = Math.max(1, Math.floor(day));
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
  switch (n % 10) {
    case 1: return `${n}st`;
    case 2: return `${n}nd`;
    case 3: return `${n}rd`;
    default: return `${n}th`;
  }
}

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const showPageGuides = useShowPageGuides();
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const formatNum = (val: number | string) => (isEn ? String(val) : toArabic(val));

  const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || theme.name === 'اسود' || theme.name === 'black' || themeKey === 'deep_black';
  const isBlackAndWhite = themeKey === 'deep_black' || theme.name === 'أبيض وأسود';
  const isDarkSurface = Boolean(theme.isDark) || isBlackTheme || themeKey === 'black_gold';
  const recessedInputShadow = isDarkSurface
    ? 'inset 0 3px 6px rgba(0, 0, 0, 0.8), inset 0 -1px 1.5px rgba(255, 255, 255, 0.12)'
    : 'inset 0 3px 6px rgba(15, 23, 42, 0.14), inset 0 -1.5px 2px rgba(255, 255, 255, 0.9), 0 1px 0 rgba(255, 255, 255, 0.85)';
  
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.accent || (isBlackAndWhite ? '#FFFFFF' : (theme.palette?.[0] || '#2E7D5E')));
  const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
  const surfaceCardClass = isBlackTheme
    ? 'bg-[#18181b] text-white'
    : 'bg-white dark:bg-[#1E293B] text-slate-800 dark:text-white';
  const innerButtonClass = isBlackTheme
    ? 'bg-[#27272a] text-white'
    : 'bg-white dark:bg-[#0F172A] text-slate-800 dark:text-white';
  const recessedWellClass = isBlackTheme
    ? 'bg-[#27272a]/55'
    : 'bg-slate-50/90 dark:bg-[#0F172A]/60';

  const [allSettings, setAllSettings] = useState<WirdSettings[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempMode, setTempMode] = useState<'days' | 'pages'>('days');
  const [tempValue, setTempValue] = useState<string>('30');
  const [tempName, setTempName] = useState<string>('');
  const [tempReminderEnabled, setTempReminderEnabled] = useState<boolean>(true);
  const [tempReminderTime, setTempReminderTime] = useState<string>('10:00');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [calcMethod, setCalcMethod] = useState<'remaining' | 'total'>('remaining');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const settings = allSettings.find(s => s.id === activeId) || null;
  const [showSettingsTour, setShowSettingsTour] = useState(false);
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
        if (sanitizedStartPage > 1 && (p.completedDays?.includes(1) || p.currentDay > 1 || sanitizedStartPage > 600 || (p.mode === 'days' && p.value === 30))) {
          sanitizedStartPage = 1;
          wasSanitized = true;
        }

        const totalDays = p.mode === 'days' ? p.value : Math.ceil(TOTAL_PAGES / p.value);
        let sanitizedCurrentDay = Math.min(Math.max(1, p.currentDay || 1), totalDays);
        let sanitizedCompletedDays: number[] = Array.isArray(p.completedDays) ? [...p.completedDays] : [];


        // Clean duplicates and sort completedDays
        sanitizedCompletedDays = Array.from(new Set(sanitizedCompletedDays)).sort((a, b) => a - b);

        // Ensure currentDay aligns with completedDays
        if (sanitizedCompletedDays.length > 0) {
          const maxCompleted = Math.max(...sanitizedCompletedDays);
          const expectedNextDay = Math.min(maxCompleted + 1, totalDays);
          if (sanitizedCurrentDay !== expectedNextDay) {
            sanitizedCurrentDay = expectedNextDay;
            wasSanitized = true;
          }
        }

        // Check if lastPage is out of range for the current day
        const dayRange = getWirdDayRange(sanitizedCurrentDay, { ...p, startPage: sanitizedStartPage });
        let sanitizedLastPage = p.lastPage;
        let sanitizedLastAyah = p.lastAyah;
        if (sanitizedLastPage && (sanitizedLastPage < dayRange.start || sanitizedLastPage > dayRange.end)) {
          sanitizedLastPage = undefined;
          sanitizedLastAyah = undefined;
          wasSanitized = true;
        }

        return {
          ...p,
          startPage: sanitizedStartPage,
          currentDay: sanitizedCurrentDay,
          completedDays: sanitizedCompletedDays,
          lastPage: sanitizedLastPage,
          lastAyah: sanitizedLastAyah,
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
      setTempReminderTime(settings.reminderTime || '10:00');
    }
  }, [settings]);

  const [nameError, setNameError] = useState(false);

  const handleStart = async () => {
    if (!tempName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);

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
    const profileName = tempName.trim();

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
    setNameError(false);
    setTempReminderEnabled(true);
    setTempReminderTime('10:00');
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
    setNameError(false);
    setTempReminderEnabled(profile.reminderEnabled !== false);
    setTempReminderTime(profile.reminderTime || '10:00');
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
      setNameError(false);
      setTempReminderEnabled(settings.reminderEnabled !== false);
      setTempReminderTime(settings.reminderTime || '10:00');
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
        lastPage: undefined,
        lastAyah: undefined,
        startDate: new Date().toISOString(),
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
      setNameError(false);
      setCalcMethod('total');
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
        lastPage: undefined,
        lastAyah: undefined,
        startDate: new Date().toISOString(),
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
      setNameError(false);
      setCalcMethod('total');
      setShowSettings(true);
    }
  };

  const markDayCompleted = async () => {
    if (!settings) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const totalDays = getTotalDays();
    if (!settings.completedDays.includes(settings.currentDay)) {
      const newCompleted = [...settings.completedDays, settings.currentDay];
      const newCurrentDay = settings.currentDay < totalDays ? settings.currentDay + 1 : settings.currentDay;
      const newWird: WirdSettings = {
        ...settings,
        completedDays: newCompleted,
        currentDay: newCurrentDay,
        lastPage: undefined,
        lastAyah: undefined,
        lastCompletedDate: todayStr
      };
      const newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
      saveAllSettings(newProfiles, settings.id);
      await syncDailyWirdNotifications(language);
    }
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

  const getDayRange = (day: number, profileOverride?: WirdSettings) => {
    const active = profileOverride || settings;
    if (!active) return { start: 1, end: 21 };
    return getWirdDayRange(day, active);
  };

  // 3D Sculpted Settings Screen (Matching Tasbeeh & Memorization)
  const renderSettings = () => (
    <div 
      className={`app-page-card border-0 p-5 rounded-3xl ${surfaceCardClass} ${isEn ? 'text-left' : 'text-right'}`}
    >
      <h2 className="text-xl font-black mb-4 text-center font-cairo" style={{ color: primaryColor, fontFamily: "'Cairo', sans-serif" }}>
        {settings ? (isEn ? 'Edit Khatma Plan' : 'تعديل خطة الختمة') : (isEn ? 'New Khatma Setup' : 'إعداد ختمة جديدة')}
      </h2>
      
      <div className="space-y-4">
        {/* Profile Name */}
        <div id="wird-name-container" className="space-y-1.5">
          <label className="block text-xs font-bold opacity-80 px-1">
            {isEn ? 'Khatma / User Name:' : 'اسم الختمة / المستخدم:'} <span className="text-red-500 font-bold">*</span>
          </label>
          <input 
            type="text"
            value={tempName}
            onChange={(e) => {
              setTempName(e.target.value);
              if (e.target.value.trim()) setNameError(false);
            }}
            className={`border-0 w-full rounded-2xl p-3.5 ${isEn ? 'text-left' : 'text-right'} font-bold text-sm focus:outline-none focus:ring-2 transition-all ${
              nameError
                ? 'ring-2 ring-red-500 bg-red-50/60 dark:bg-red-950/30'
                : (isBlackTheme ? 'bg-[#27272a] text-white placeholder:text-zinc-500' : 'bg-slate-100/90 dark:bg-[#0F172A] text-slate-800 dark:text-white placeholder:text-slate-400')
            }`}
            style={{ boxShadow: recessedInputShadow }}
            placeholder={isEn ? 'e.g. Ahmed, Ramadan Khatma...' : 'مثال: أحمد، ختمة رمضان...'}
          />
          {nameError && (
            <p className="text-xs font-bold text-red-500 px-1 pt-0.5 animate-bounce">
              {isEn ? '⚠️ Please enter Khatma / User name before starting' : '⚠️ يرجى تسجيل اسم الختمة / المستخدم أولاً قبل البدء'}
            </p>
          )}
        </div>

        {/* Khatma Method Segmented Chips */}
        <div id="wird-mode-container" className="space-y-1.5">
          <label className="block text-xs font-bold opacity-80 px-1">
            {isEn ? 'Khatma Method:' : 'طريقة الختمة:'}
          </label>
          <div className={`grid grid-cols-2 p-2 pb-2.5 rounded-2xl gap-2.5 border-0 overflow-visible ${recessedWellClass}`}>
            <button 
              type="button"
              onClick={() => setTempMode('days')}
              className={`app-page-card border-0 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                tempMode === 'days' 
                  ? 'font-black' 
                  : `font-bold ${surfaceCardClass}`
              }`}
              style={tempMode === 'days' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
            >
              {isEn ? 'By Days' : 'حسب الأيام'}
            </button>
            <button 
              type="button"
              onClick={() => setTempMode('pages')}
              className={`app-page-card border-0 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                tempMode === 'pages' 
                  ? 'font-black' 
                  : `font-bold ${surfaceCardClass}`
              }`}
              style={tempMode === 'pages' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
            >
              {isEn ? 'By Pages' : 'حسب الصفحات'}
            </button>
          </div>
        </div>

        {/* Number of Days or Pages */}
        <div id="wird-value-container" className="space-y-1.5">
          <label className="block text-xs font-bold opacity-80 px-1">
            {tempMode === 'days' 
              ? (isEn ? 'Target Number of Days:' : 'عدد الأيام المستهدفة للختمة:') 
              : (isEn ? 'Pages to Read Daily:' : 'عدد الصفحات للقراءة يومياً:')}
          </label>
          <input 
            type="text"
            inputMode="numeric"
            value={isEn ? tempValue : toArabic(tempValue)}
            onFocus={() => {
              setTempValue('');
            }}
            onChange={(e) => {
              const val = toEnglishDigits(e.target.value);
              if (val === '' || /^\d*$/.test(val)) {
                setTempValue(val);
              }
            }}
            className={`border-0 w-full rounded-2xl p-3.5 text-center text-2xl font-black focus:outline-none focus:ring-2 transition-all ${
              isBlackTheme ? 'bg-[#27272a]' : 'bg-slate-100/90 dark:bg-[#0F172A]'
            }`}
            style={{ color: primaryColor, boxShadow: recessedInputShadow }}
            placeholder={formatNum(tempMode === 'days' ? '30' : '20')}
          />
        </div>

        {/* Calculation method for remaining */}
        {settings && settings.completedDays.length > 0 && (
          <div className={`p-3.5 rounded-2xl space-y-2.5 border-0 ${recessedWellClass}`}>
            <label className="block font-black text-xs" style={{ color: primaryColor }}>
              {isEn ? 'Remaining Calculation Method:' : 'طريقة احتساب المتبقي:'}
            </label>
            <div className="space-y-2.5 overflow-visible pb-1">
              <button 
                type="button"
                onClick={() => setCalcMethod('remaining')}
                className={`app-page-card border-0 w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  calcMethod === 'remaining' 
                    ? 'font-black' 
                    : `font-bold opacity-85 hover:opacity-100 ${surfaceCardClass}`
                }`}
                style={calcMethod === 'remaining' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
              >
                <span>
                  {isEn ? 'New plan for remaining (Input is future days)' : 'خطة جديدة للمتبقي (العدد المدخل هو للمستقبل)'}
                </span>
                <div 
                  className={`${calcMethod === 'remaining' ? 'app-3d-badge' : 'app-3d-recessed-field'} border-0 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all`} 
                  style={{ 
                    backgroundColor: calcMethod === 'remaining'
                      ? (isBlackTheme ? '#18181b' : '#FFFFFF')
                      : (isDarkSurface ? '#0f172a' : '#e2e8f0'),
                    color: calcMethod === 'remaining' ? (isBlackTheme ? '#FFFFFF' : primaryColor) : 'transparent',
                    boxShadow: calcMethod === 'remaining'
                      ? '0 2.5px 0 rgba(0, 0, 0, 0.22), 0 4px 8px rgba(0, 0, 0, 0.18), inset 0 1.5px 1px rgba(255, 255, 255, 0.92)'
                      : undefined
                  }}
                >
                  {calcMethod === 'remaining' && <Check size={12} strokeWidth={3} />}
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setCalcMethod('total')}
                className={`app-page-card border-0 w-full p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} text-xs flex items-center justify-between gap-2 transition-all cursor-pointer ${
                  calcMethod === 'total' 
                    ? 'font-black' 
                    : `font-bold opacity-85 hover:opacity-100 ${surfaceCardClass}`
                }`}
                style={calcMethod === 'total' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
              >
                <span>
                  {isEn ? 'Modify current plan (Input is total)' : 'تعديل الخطة الحالية (العدد المدخل هو الإجمالي)'}
                </span>
                <div 
                  className={`${calcMethod === 'total' ? 'app-3d-badge' : 'app-3d-recessed-field'} border-0 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all`} 
                  style={{ 
                    backgroundColor: calcMethod === 'total'
                      ? (isBlackTheme ? '#18181b' : '#FFFFFF')
                      : (isDarkSurface ? '#0f172a' : '#e2e8f0'),
                    color: calcMethod === 'total' ? (isBlackTheme ? '#FFFFFF' : primaryColor) : 'transparent',
                    boxShadow: calcMethod === 'total'
                      ? '0 2.5px 0 rgba(0, 0, 0, 0.22), 0 4px 8px rgba(0, 0, 0, 0.18), inset 0 1.5px 1px rgba(255, 255, 255, 0.92)'
                      : undefined
                  }}
                >
                  {calcMethod === 'total' && <Check size={12} strokeWidth={3} />}
                </div>
              </button>
            </div>
            <p className="text-[10px] opacity-65 leading-tight pt-1">
              {isEn ? '* Will continue from the page following your last read page.' : '* سيتم البدء من الصفحة التالية لآخر صفحة قرأتها.'}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2 pb-1 overflow-visible" id="wird-start-container">
          <button 
            type="button"
            onClick={handleStart}
            className="app-page-card border-0 flex-1 py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor, color: btnTextColor }}
          >
            <Play size={20} fill="currentColor" />
            <span>{settings ? (isEn ? 'Save Plan' : 'حفظ الخطة') : (isEn ? 'Start Khatma' : 'ابدأ الختمة')}</span>
          </button>
          
          {(settings || allSettings.length > 0) && (
            <button 
              type="button"
              onClick={handleCancelEdit}
              className={`app-page-card border-0 py-4 px-5 rounded-2xl font-bold text-base flex items-center justify-center transition-all cursor-pointer ${surfaceCardClass}`}
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
    const canContinue = Boolean(
      settings.lastPage && 
      !isCompleted && 
      settings.lastPage >= startPage && 
      settings.lastPage <= endPage
    );

    const targetPage = canContinue ? settings.lastPage! : startPage;
    let targetAyahRef = canContinue ? settings.lastAyah : undefined;

    if (canContinue && !targetAyahRef) {
      try {
        const savedWird = localStorage.getItem('last_read_ayah_wird');
        if (savedWird) {
          const parsed = JSON.parse(savedWird);
          if (parsed?.s && parsed?.a && (!parsed.page || parsed.page === targetPage)) {
            targetAyahRef = { s: parsed.s, a: parsed.a };
          }
        }
      } catch (e) {}
    }

    const ayahDetails = getAyahDetails(targetPage, targetAyahRef);

    return (
      <div className="space-y-4">
        {/* Progress Card */}
        <div 
          id="wird-progress-container" 
          className={`app-page-card border-0 rounded-3xl p-5 space-y-3 ${surfaceCardClass}`}
        >
          <div className="flex justify-between items-center">
            <span className="font-black text-sm">
              {isEn ? 'Completion Rate' : 'نسبة الإنجاز'}
            </span>
            <span 
              className="app-3d-badge border-0 px-3 py-1 rounded-full font-black text-sm tabular-nums"
              style={{
                backgroundColor: hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.1),
                color: primaryColor
              }}
            >
              {formatNum(progress.toFixed(1))}%
            </span>
          </div>

          {/* Thick Rounded 3D Progress Bar */}
          <div className={`app-3d-progress-track border-0 w-full h-4 rounded-full overflow-hidden p-0.5 ${isBlackTheme ? 'bg-[#09090b]' : 'bg-slate-100 dark:bg-[#0F172A]'}`}>
            <div 
              className="app-3d-progress-fill h-full rounded-full"
              style={{ backgroundColor: primaryColor, width: `${progress}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs opacity-75 font-bold pt-0.5">
            <span>{isEn ? `Day ${settings.currentDay} of ${totalDays}` : `اليوم ${toArabic(settings.currentDay)} من ${toArabic(totalDays)}`}</span>
            <span>{isEn ? `${settings.completedDays.length} days done` : `${toArabic(settings.completedDays.length)} يوم مكتمل`}</span>
          </div>
        </div>

        {/* Current Day's Reading Card */}
        <div 
          id="wird-today-card" 
          className={`app-page-card border-0 rounded-3xl p-4 sm:p-5 text-center space-y-3.5 ${surfaceCardClass}`}
        >
          <div id="wird-today-container" className={`p-3.5 rounded-2xl border-0 ${recessedWellClass}`}>
            <div className="flex items-center justify-center mb-2.5">
              <h3 className="text-sm font-black" style={{ color: primaryColor }}>
                {isEn
                  ? `Today's Wird ${getEnglishOrdinal(settings.currentDay)} - ${settings.currentDay}`
                  : `ورد اليوم ${getArabicDayOrdinal(settings.currentDay)} - ${toArabic(settings.currentDay)}`}
              </h3>
            </div>
            
            {hasPages ? (
              <div className="grid grid-cols-2 gap-2.5 w-full overflow-visible pb-1">
                <button
                  type="button"
                  onClick={() => {
                    const startDetails = getAyahDetails(startPage);
                    handleOpenQuran(
                      startPage,
                      { s: startDetails.surahNumber, a: startDetails.ayahNumber },
                      isEn ? 'translation' : 'mushaf'
                    );
                  }}
                  className={`app-page-card border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-center cursor-pointer ${surfaceCardClass}`}
                >
                  <span className="text-xs font-bold opacity-80">{isEn ? 'From Page' : 'من صفحة'}</span>
                  <span className="text-sm font-black" style={{ color: primaryColor }}>{formatNum(startPage)}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const endDetails = getAyahDetails(endPage);
                    handleOpenQuran(
                      endPage,
                      { s: endDetails.surahNumber, a: endDetails.ayahNumber },
                      isEn ? 'translation' : 'mushaf'
                    );
                  }}
                  className={`app-page-card border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center gap-1.5 text-center cursor-pointer ${surfaceCardClass}`}
                >
                  <span className="text-xs font-bold opacity-80">{isEn ? 'To Page' : 'إلى صفحة'}</span>
                  <span className="text-sm font-black" style={{ color: primaryColor }}>{formatNum(endPage)}</span>
                </button>
              </div>
            ) : (
              <div className={`app-inner-3d-box border-0 p-3 rounded-2xl ${innerButtonClass}`}>
                <p className="text-sm font-bold" style={{ color: primaryColor }}>
                  {isEn ? 'You have completed all pages!' : 'لقد أكملت جميع الصفحات بارك الله فيك!'}
                </p>
              </div>
            )}
          </div>

          {/* Current Reading Position Card (4 Details Grid) */}
          {hasPages && (
            <div 
              onClick={() => {
                handleOpenQuran(
                  ayahDetails.pageNumber, 
                  { s: ayahDetails.surahNumber, a: ayahDetails.ayahNumber }, 
                  isEn ? 'translation' : 'mushaf'
                );
              }}
              className={`p-3.5 rounded-2xl border-0 cursor-pointer transition-all ${recessedWellClass}`}
            >
              <div className="text-xs font-bold opacity-65 mb-2 text-center">
                {isEn ? 'Current Reading Position' : 'موضع القراءة الحالي'}
              </div>
              <div className="grid grid-cols-2 gap-2.5 w-full overflow-visible pb-0.5">
                {/* اسم السورة */}
                <div 
                  className={`wird-inner-raised border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center text-center ${innerButtonClass}`}
                >
                  <span className="font-extrabold text-sm truncate max-w-full">
                    {isEn ? ayahDetails.surahNameEn : `سورة ${ayahDetails.surahNameAr}`}
                  </span>
                </div>

                {/* رقم الآية */}
                <div 
                  className={`wird-inner-raised border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center text-center ${innerButtonClass}`}
                >
                  <span className="font-extrabold text-sm">
                    {isEn ? `Ayah ${ayahDetails.ayahNumber}` : `الآية ${toArabic(ayahDetails.ayahNumber)}`}
                  </span>
                </div>

                {/* رقم الجزء */}
                <div 
                  className={`wird-inner-raised border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center text-center ${innerButtonClass}`}
                >
                  <span className="font-extrabold text-sm">
                    {isEn ? `Juz ${ayahDetails.juzNumber}` : `الجزء ${toArabic(ayahDetails.juzNumber)}`}
                  </span>
                </div>

                {/* رقم الصفحة */}
                <div 
                  className={`wird-inner-raised border-0 rounded-2xl py-2.5 px-3 flex items-center justify-center text-center ${innerButtonClass}`}
                >
                  <span className="font-extrabold text-sm">
                    {isEn ? `Page ${ayahDetails.pageNumber}` : `الصفحة ${toArabic(ayahDetails.pageNumber)}`}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Sculpted 3D Action Button */}
          <div className="flex flex-col gap-2.5 pt-1 pb-1 items-center justify-center overflow-visible" id="wird-actions-container">
            {hasPages ? (
              !isCompleted ? (
                <button 
                  id="btn-wird-start-now"
                  type="button"
                  onClick={() => {
                    handleOpenQuran(
                      ayahDetails.pageNumber, 
                      { s: ayahDetails.surahNumber, a: ayahDetails.ayahNumber }, 
                      isEn ? 'translation' : 'mushaf'
                    );
                  }}
                  className="app-page-card border-0 px-8 py-3.5 rounded-2xl font-black flex items-center justify-center transition-all cursor-pointer mx-auto"
                  style={{ backgroundColor: primaryColor, color: btnTextColor }}
                >
                  <span className="text-base font-black tracking-wide font-cairo" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {canContinue 
                      ? (isEn ? 'Continue Reading' : 'متابعة القراءة') 
                      : (isEn ? 'Start Now' : 'ابدأ الآن')}
                  </span>
                </button>
              ) : (
                <div className="flex flex-col gap-2.5 w-full overflow-visible pb-1">
                  <div 
                    className={`app-inner-3d-box border-0 w-full py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 text-sm ${innerButtonClass}`}
                    style={{ color: primaryColor }}
                  >
                    <CheckCircle size={18} />
                    <span>{isEn ? 'Completed Today\'s Wird' : 'أنجزت الورد كاملاً لهذا اليوم'}</span>
                  </div>
                  <div className="flex gap-2.5 overflow-visible pb-1">
                    <button 
                      type="button"
                      onClick={handleStartNewWird}
                      className="app-page-card border-0 flex-1 py-3.5 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-xs cursor-pointer"
                      style={{ backgroundColor: primaryColor, color: btnTextColor }}
                    >
                      <Plus size={16} />
                      <span>{isEn ? 'Start New Wird' : 'بداية ورد جديد'}</span>
                    </button>
                    <button 
                      type="button"
                      onClick={() => onNavigate('home')}
                      className={`app-page-card border-0 flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs cursor-pointer ${surfaceCardClass}`}
                    >
                      <Home size={16} />
                      <span>{isEn ? 'Home' : 'الرئيسية'}</span>
                    </button>
                  </div>
                </div>
              )
            ) : null}
          </div>
        </div>

        {/* Action Controls (Matching Tasbeeh ThreeDButton Grid) */}
        <div className="grid grid-cols-2 gap-3 overflow-visible pb-1">
          <button 
            id="wird-edit-btn"
            type="button"
            onClick={handleEdit}
            className={`app-page-card border-0 py-3.5 px-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-xs sm:text-sm cursor-pointer ${surfaceCardClass}`}
            style={{ color: primaryColor }}
          >
            <Settings size={16} />
            <span>{isEn ? 'Edit Khatma' : 'تعديل الختمة'}</span>
          </button>
          
          <button 
            id="wird-reset-btn"
            type="button"
            onClick={handleReset}
            className={`app-page-card border-0 py-3.5 px-3 rounded-2xl font-black flex items-center justify-center gap-2 transition-all text-xs sm:text-sm cursor-pointer text-red-500 ${surfaceCardClass}`}
          >
            <RotateCcw size={16} />
            <span>{isEn ? 'Reset' : 'إعادة تعيين'}</span>
          </button>
        </div>
      </div>
    );
  };

  // 3D Sculpted Profile Selector
  const renderProfileSelector = () => {
    if (allSettings.length === 0) return null;
    return (
      <div className="relative mb-3.5">
        <button 
          id="wird-profile-selector"
          type="button"
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`app-page-card border-0 w-full p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${surfaceCardClass}`}
        >
          <div className="flex items-center gap-3">
            <div 
              className={`app-3d-badge border-0 w-10 h-10 rounded-2xl flex items-center justify-center ${
                isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'
              }`}
              style={{ color: primaryColor }}
            >
              <User size={20} />
            </div>
            <div className={isEn ? 'text-left' : 'text-right'}>
              <p className="text-[11px] opacity-60 font-semibold">{isEn ? 'Current User' : 'المستخدم الحالي'}</p>
              <p className="font-black text-sm">{settings?.name || (isEn ? 'Select User' : 'اختر مستخدماً')}</p>
            </div>
          </div>
          <div 
            className={`app-3d-badge border-0 w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
              isBlackTheme ? 'bg-white/10 text-white' : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-zinc-300'
            }`}
          >
            <ChevronDown size={16} className={`transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {showProfileMenu && (
          <>
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setShowProfileMenu(false)}
            />
            <div 
              className={`app-page-card border-0 absolute top-full left-0 right-0 mt-2 rounded-2xl z-50 overflow-visible p-2.5 pb-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200 ${surfaceCardClass} ${isEn ? 'text-left' : 'text-right'}`}
            >
              {allSettings.map(profile => {
                const isProfileActive = activeId === profile.id;
                return (
                  <div 
                    key={profile.id}
                    onClick={() => {
                      saveAllSettings(allSettings, profile.id);
                      setShowProfileMenu(false);
                      syncDailyWirdNotifications(language);
                    }}
                    className={`app-page-card border-0 p-3 rounded-xl flex items-center justify-between cursor-pointer transition-all overflow-visible ${
                      isProfileActive 
                        ? `${surfaceCardClass} font-black` 
                        : `${surfaceCardClass} opacity-85 hover:opacity-100`
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <User 
                        size={18} 
                        className={isProfileActive ? 'shrink-0' : 'opacity-45 shrink-0'}
                        style={isProfileActive ? { color: primaryColor } : {}}
                      />
                      <span className="truncate" style={isProfileActive ? { color: primaryColor } : {}}>
                        {profile.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 overflow-visible pb-1">
                      <button 
                        type="button"
                        onClick={(e) => handleEditProfile(profile, e)}
                        className={`app-page-card border-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer ${surfaceCardClass}`}
                        title={isEn ? 'Edit' : 'تعديل'}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => handleDeleteProfile(profile.id, e)}
                        className={`app-page-card border-0 w-8 h-8 rounded-xl flex items-center justify-center text-red-500 transition-all cursor-pointer ${surfaceCardClass}`}
                        title={isEn ? 'Delete' : 'حذف'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <button 
                type="button"
                onClick={() => {
                  handleAddNew();
                  setShowProfileMenu(false);
                }}
                className="app-page-card border-0 w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-black text-sm transition-all cursor-pointer"
                style={{ backgroundColor: primaryColor, color: btnTextColor }}
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65" dir={isEn ? 'ltr' : 'rtl'}>
        <div 
          className={`app-page-card border-0 w-full max-w-sm p-6 rounded-3xl ${isEn ? 'text-left' : 'text-center'} ${surfaceCardClass}`}
        >
          <div className="app-3d-badge border-0 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-500/15 text-red-500">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-black mb-2">
            {isEn ? 'Delete User?' : 'حذف المستخدم؟'}
          </h3>
          <p className="mb-4 text-xs opacity-70 leading-relaxed">
            {isEn 
              ? `Are you sure you want to delete "${profileToDelete.name}"? This action cannot be undone.` 
              : `هل أنت متأكد من حذف "${profileToDelete.name}"؟ لا يمكن التراجع عن هذه الخطوة.`}
          </p>
          
          {isWirdIncomplete && (
            <div className="app-inner-3d-box border-0 p-3 mb-5 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{isEn ? "Warning: Today's wird has not been completed for this user yet." : "تنبيه: لم يتم إكمال ورد اليوم لهذا المستخدم بعد."}</span>
            </div>
          )}

          <div className="flex gap-3 overflow-visible pb-1">
            <button 
              type="button"
              onClick={confirmDeleteProfile}
              className="app-page-card border-0 flex-1 py-3.5 rounded-2xl font-black text-sm transition-all text-white cursor-pointer"
              style={{
                backgroundColor: '#EF4444',
                color: '#FFFFFF'
              }}
            >
              {isEn ? 'Confirm Delete' : 'تأكيد الحذف'}
            </button>
            <button 
              type="button"
              onClick={() => setShowDeleteConfirm(null)}
              className={`app-page-card border-0 flex-1 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer ${surfaceCardClass}`}
            >
              {isEn ? 'Cancel' : 'إلغاء'}
            </button>
          </div>
        </div>
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
      className="h-[100dvh] flex flex-col overflow-hidden" 
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
            {/* Back button */}
            <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center gap-1.5`}>
              <button
                onClick={handleHomeClick}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? 'Go Back' : 'رجوع للخلف'}
                aria-label={isEn ? 'Go Back' : 'رجوع للخلف'}
              >
                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
            </div>

            {/* Title in center */}
            <div className="text-center px-12 min-w-0">
              <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate" style={{ color: 'var(--qr-bar-text)' }}>
                {isEn ? 'Daily Wird' : 'الورد اليومي'}
              </h1>
            </div>

            {/* Home / Page Lock / Guide icons */}
            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
              {showPageGuides && (
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
              )}
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

      <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 app-scroll-safe">
        <div className="w-full max-w-md mx-auto space-y-3">
          {!showSettings && renderProfileSelector()}
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
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
