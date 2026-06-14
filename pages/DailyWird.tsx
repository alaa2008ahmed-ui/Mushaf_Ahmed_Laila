import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { CheckCircle, BookOpen, RotateCcw, Play, Settings, X, User, Plus, Trash2, ChevronDown, Edit2, Home } from 'lucide-react';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import ResetConfirmModal from '../components/DailyWird/ResetConfirmModal';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';

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
}

const TOTAL_PAGES = 604;

import { registerBackInterceptor } from '../hooks/useBackButton';

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const isDefaultTheme = themeKey === 'default';
  const isBlackAndWhite = themeKey === 'deep_black';
  const isBlackTheme = theme.bgColor === '#000000';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
  const secondaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : (theme.palette[1] || theme.palette[0])));
  const btnTextColor = isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : (isBlackAndWhite ? '#000000' : '#FFFFFF'));

  const btnBorderParts = React.useMemo(() => {
    if (!theme.btnBorder || theme.btnBorder === 'none') {
      return { borderWidth: 0, borderStyle: 'none' as const, borderColor: 'transparent' };
    }
    const parts = theme.btnBorder.split(' ');
    return {
      borderWidth: parts[0] || '1px',
      borderStyle: (parts[1] || 'solid') as any,
      borderColor: parts[2] || primaryColor
    };
  }, [theme.btnBorder, primaryColor]);

  const [allSettings, setAllSettings] = useState<WirdSettings[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tempMode, setTempMode] = useState<'days' | 'pages'>('days');
  const [tempValue, setTempValue] = useState<string>('30');
  const [tempName, setTempName] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [calcMethod, setCalcMethod] = useState<'remaining' | 'total'>('remaining');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const settings = allSettings.find(s => s.id === activeId) || null;

  const toEnglishDigits = (str: string) => {
    return str.replace(/[٠-٩]/g, (d) => (d.charCodeAt(0) - 1632).toString())
              .replace(/[۰-۹]/g, (d) => (d.charCodeAt(0) - 1776).toString());
  };

  useEffect(() => {
    const saved = localStorage.getItem('dailyWirdSettings_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      const profiles = parsed.profiles || [];
      const activeProfileId = parsed.activeId || (profiles.length > 0 ? profiles[0].id : null);
      
      setAllSettings(profiles);
      setActiveId(activeProfileId);

      // Check if the active profile is completed and redirect to settings if so
      if (activeProfileId) {
        const activeProfile = profiles.find((p: WirdSettings) => p.id === activeProfileId);
        if (activeProfile) {
          const totalDays = activeProfile.mode === 'days' ? activeProfile.value : Math.ceil(TOTAL_PAGES / activeProfile.value);
          if (activeProfile.completedDays.length >= totalDays) {
            // Use a timeout to ensure state is settled before triggering reset/settings
            setTimeout(() => {
              // We need to find the profile again from the latest state or just use the one we found
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
      // Migrate from old single settings if exists
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

  const handleStart = () => {
    const inputVal = parseInt(tempValue) || (tempMode === 'days' ? 30 : 20);
    let finalValue = inputVal;
    let startPage = 1;
    const profileName = tempName.trim() || `مستخدم ${allSettings.length + 1}`;

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
      currentDay: 1,
      completedDays: [],
      isActive: true,
      startPage: startPage,
      lastPage: undefined,
      lastAyah: undefined
    };

    let newProfiles: WirdSettings[];
    if (settings) {
      newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    } else {
      newProfiles = [...allSettings, newWird];
    }

    saveAllSettings(newProfiles, newWird.id);
    setShowSettings(false);
  };

  const handleAddNew = () => {
    setTempMode('days');
    setTempValue('30');
    setTempName('');
    setActiveId(null); // This tells handleStart to create a new one
    setShowSettings(true);
  };

  const handleEditProfile = (profile: WirdSettings, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveId(profile.id);
    setTempMode(profile.mode);
    setTempValue(profile.value.toString());
    setTempName(profile.name);
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
        isActive: true
      };
      const newProfiles = allSettings.map(p => p.id === settings.id ? resetProfile : p);
      saveAllSettings(newProfiles, settings.id);
      
      setTempMode('days');
      setTempValue('30');
      setTempName(settings.name);
      setCalcMethod('remaining'); // Reset to default
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
        isActive: true
      };
      const newProfiles = allSettings.map(p => p.id === settings.id ? resetProfile : p);
      saveAllSettings(newProfiles, settings.id);
      
      setTempMode(settings.mode);
      setTempValue(settings.value.toString());
      setTempName(settings.name);
      setCalcMethod('remaining');
      setShowSettings(true);
    }
  };

  const setupTutorialSteps: TutorialStep[] = [
    {
      id: 'wird-setup-welcome',
      title: 'إعداد الختمة الجديدة',
      text: 'مرحباً بك! هنا يمكنك البدء بتنظيم وردك القرآني. سنقوم بإنشاء خطة مخصصة تناسب وقتك وقدرتك.',
      icon: <Settings className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-setup-mode',
      title: 'طريقة الختم',
      text: 'اختر ما إذا كنت تفضل الختم خلال عدد معين من الأيام، أو قراءة عدد محدد من الصفحات يومياً.',
      selector: '#wird-mode-container',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-setup-value',
      title: 'تحديد المقدار',
      text: 'أدخل عدد الأيام الإجمالي للختمة، أو عدد الصفحات التي تلتزم بقراءتها كل يوم.',
      selector: '#wird-value-container',
      icon: <Edit2 className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-setup-start',
      title: 'ابدأ رحلتك',
      text: 'بعد الانتهاء من الإعدادات، اضغط هنا لتبدأ رحلتك المباركة مع القرآن الكريم.',
      selector: '#wird-start-container',
      icon: <Play className="w-8 h-8 text-white" />
    }
  ];

  const progressTutorialSteps: TutorialStep[] = [
    {
      id: 'wird-progress-welcome',
      title: 'متابعة إنجازك',
      text: 'رائع! لقد بدأت ختمتك. هنا ستجد كل ما تحتاجه لمتابعة تقدمك اليومي والالتزام بوردك.',
      icon: <CheckCircle className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-progress-bar',
      title: 'مؤشر الإنجاز',
      text: 'هذا الشريط يوضح لك النسبة المئوية لما أنجزته من الختمة حتى الآن. كلما قرأت أكثر، اقتربت من الهدف!',
      selector: '#wird-progress-container',
      icon: <CheckCircle className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-progress-today',
      title: 'ورد اليوم',
      text: 'هنا يظهر لك بالضبط الصفحات المطلوب قراءتها اليوم. اضغط على "افتح المصحف" لتبدأ القراءة مباشرة.',
      selector: '#wird-today-container',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-progress-actions',
      title: 'إدارة الورد',
      text: 'بعد الانتهاء من القراءة، لا تنسَ الضغط على "تمت القراءة" لتحديث تقدمك.',
      selector: '#wird-actions-container',
      icon: <Settings className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-edit-highlight',
      title: 'تعديل الختمة',
      text: 'إذا شعرت أن الخطة الحالية سريعة جداً أو بطيئة، يمكنك الضغط هنا لتعديل عدد الأيام أو الصفحات في أي وقت.',
      selector: '#wird-edit-btn',
      icon: <Settings className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-reset-highlight',
      title: 'إعادة تعيين الختمة',
      text: 'في حال أردت البدء من جديد تماماً أو تغيير نقطة البداية، استخدم هذا الزر لتصفير التقدم الحالي وإعادة ضبط الإعدادات.',
      selector: '#wird-reset-btn',
      icon: <RotateCcw className="w-8 h-8 text-white" />
    }
  ];

  const markDayCompleted = () => {
    if (!settings) return;
    const newCompleted = [...settings.completedDays, settings.currentDay];
    const newWird = {
      ...settings,
      completedDays: newCompleted,
      currentDay: settings.currentDay < getTotalDays() ? settings.currentDay + 1 : settings.currentDay,
      lastPage: undefined,
      lastAyah: undefined
    };
    const newProfiles = allSettings.map(p => p.id === settings.id ? newWird : p);
    saveAllSettings(newProfiles, settings.id);
  };

  const getTotalDays = () => {
    if (!settings) return 30;
    return settings.mode === 'days' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const getPagesPerDay = () => {
    if (!settings) return 20;
    return settings.mode === 'pages' ? settings.value : Math.ceil(TOTAL_PAGES / settings.value);
  };

  const handleOpenQuran = (page: number, initialAyah?: { s: number; a: number }) => {
    const targetPage = Math.max(1, page);
    onNavigate('quran', { 
      page: targetPage, 
      surah: initialAyah?.s, 
      ayah: initialAyah?.a, 
      isWird: true
    });
  };

  const renderSettings = () => (
    <div className="p-4 rounded-2xl shadow-lg border" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'inherit' }}>
      <h2 className="text-xl font-bold mb-4 text-center">{settings ? 'تعديل الختمة' : 'إعداد ختمة جديدة'}</h2>
      
      <div className="space-y-4">
        <div id="wird-name-container">
          <label className="block mb-2 font-semibold">اسم المستخدم / الختمة:</label>
          <input 
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full border rounded-xl p-3 text-right focus:outline-none focus:border-green-500"
            style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'), borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}
            placeholder="مثال: أحمد، ختمة رمضان..."
          />
        </div>

        <div id="wird-mode-container">
          <label className="block mb-2 font-semibold">طريقة الختمة:</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setTempMode('days')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'days' ? (isDefaultTheme ? 'border-black bg-white text-black' : '') : (isDefaultTheme ? 'border-gray-200 bg-white text-black' : 'border-gray-300 dark:border-gray-600 opacity-60')}`}
              style={!isDefaultTheme && tempMode === 'days' ? { 
                borderColor: primaryColor, 
                backgroundColor: `${primaryColor}20`, 
                color: theme.isDark ? '#FFFFFF' : primaryColor 
              } : {}}
            >
              حسب الأيام
            </button>
            <button 
              onClick={() => setTempMode('pages')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'pages' ? (isDefaultTheme ? 'border-black bg-white text-black' : '') : (isDefaultTheme ? 'border-gray-200 bg-white text-black' : 'border-gray-300 dark:border-gray-600 opacity-60')}`}
              style={!isDefaultTheme && tempMode === 'pages' ? { 
                borderColor: primaryColor, 
                backgroundColor: `${primaryColor}20`, 
                color: theme.isDark ? '#FFFFFF' : primaryColor 
              } : {}}
            >
              حسب الصفحات
            </button>
          </div>
        </div>


        <div id="wird-value-container">
          <label className="block mb-2 font-semibold">
            {tempMode === 'days' ? 'عدد الأيام للختمة:' : 'عدد الصفحات يومياً:'}
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
            className="w-full border rounded-xl p-3 text-center text-xl font-bold focus:outline-none focus:border-green-500"
            style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'), borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}
            placeholder={tempMode === 'days' ? '30' : '20'}
          />
        </div>

        {settings && settings.completedDays.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: isDefaultTheme ? '#e5e7eb' : theme.cardBorder }}>
            <label className={`block mb-3 font-bold text-sm ${isDefaultTheme ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>طريقة احتساب المتبقي:</label>
            <div className="space-y-3">
              <button 
                onClick={() => setCalcMethod('remaining')}
                className={`w-full p-3 rounded-xl text-right text-sm flex items-center justify-between border transition-all ${calcMethod === 'remaining' ? 'border-emerald-500 bg-emerald-500/10' : (isDefaultTheme ? 'border-gray-200 bg-white' : 'border-gray-200 dark:border-gray-700')}`}
              >
                <span className={isDefaultTheme ? 'text-black' : ''}>خطة جديدة للمتبقي (العدد المدخل هو للمستقبل)</span>
                <div className={`w-4 h-4 rounded-full border-2 ${calcMethod === 'remaining' ? 'border-emerald-500 bg-emerald-500' : (isDefaultTheme ? 'border-gray-400' : 'border-gray-400')}`} />
              </button>
              <button 
                onClick={() => setCalcMethod('total')}
                className={`w-full p-3 rounded-xl text-right text-sm flex items-center justify-between border transition-all ${calcMethod === 'total' ? 'border-emerald-500 bg-emerald-500/10' : (isDefaultTheme ? 'border-gray-200 bg-white' : 'border-gray-200 dark:border-gray-700')}`}
              >
                <span className={isDefaultTheme ? 'text-black' : ''}>تعديل الخطة الحالية (العدد المدخل هو الإجمالي)</span>
                <div className={`w-4 h-4 rounded-full border-2 ${calcMethod === 'total' ? 'border-emerald-500 bg-emerald-500' : (isDefaultTheme ? 'border-gray-400' : 'border-gray-400')}`} />
              </button>
            </div>
            <p className="text-[10px] mt-2 opacity-60 leading-tight">
              * سيتم البدء من الصفحة التالية لآخر صفحة قرأتها.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6" id="wird-start-container">
          <button 
            onClick={handleStart}
            className={`flex-1 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors border-b-4 ring-2 ${isDefaultTheme ? 'bg-white text-black border-gray-200 ring-gray-100' : ''}`}
            style={(!isDefaultTheme ? { 
              backgroundColor: primaryColor, 
              color: btnTextColor,
              borderColor: isBlackAndWhite ? '#E5E5E5' : secondaryColor,
              '--tw-ring-color': `${primaryColor}40`
            } : {}) as React.CSSProperties}
          >
            <Play size={24} />
            {settings ? 'حفظ' : 'ابدأ الختمة'}
          </button>
          {(settings || allSettings.length > 0) && (
            <button 
              onClick={handleCancelEdit}
              className={`py-4 px-6 ${isDefaultTheme ? 'bg-gray-100 text-black' : 'bg-gray-500 hover:bg-gray-400 text-white'} rounded-xl font-bold text-lg flex items-center justify-center transition-colors`}
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
        <div id="wird-progress-container" className="rounded-2xl p-4 shadow-lg border" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'inherit' }}>
          <div className="flex justify-between mb-1">
            <span className="font-bold text-sm">نسبة الإنجاز</span>
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
            <span>اليوم {settings.currentDay} من {totalDays}</span>
            <span>{settings.completedDays.length} يوم مكتمل</span>
          </div>
        </div>

        {/* Current Wird */}
        <div id="wird-today-container" className="rounded-2xl p-4 shadow-lg border text-center" style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'inherit' }}>
          <h3 className={`text-lg font-bold mb-3 ${isDefaultTheme ? 'text-black' : 'text-emerald-600 dark:text-emerald-400'}`}>ورد اليوم ({settings.currentDay})</h3>
          
          <div className="flex justify-center items-center gap-3 mb-4">
            {hasPages ? (
              <>
                <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)') }}>
                  <p className="text-xs opacity-80 mb-1">من صفحة</p>
                  <p className="text-2xl font-bold">{startPage}</p>
                </div>
                <span className="text-xl opacity-50">-</span>
                <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)') }}>
                  <p className="text-xs opacity-80 mb-1">إلى صفحة</p>
                  <p className="text-2xl font-bold">{endPage}</p>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: isDefaultTheme ? '#f9fafb' : (theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)') }}>
                <p className="text-lg font-bold">لقد أكملت جميع الصفحات!</p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2" id="wird-actions-container">
            {hasPages && (
              <button 
                onClick={() => {
                  if (canContinue) {
                    handleOpenQuran(settings.lastPage!, settings.lastAyah);
                  } else {
                    handleOpenQuran(startPage);
                  }
                }}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md ${isDefaultTheme ? 'bg-white text-black border border-gray-200' : ''}`}
                style={!isDefaultTheme ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor, 
                  borderWidth: btnBorderParts.borderWidth,
                  borderStyle: btnBorderParts.borderStyle,
                  borderColor: btnBorderParts.borderColor
                } : {}}
              >
                <BookOpen size={20} />
                {canContinue ? `تكملة الورد (صفحة ${settings.lastPage})` : 'افتح المصحف للقراءة'}
              </button>
            )}

            {!isCompleted ? (
              <button 
                onClick={markDayCompleted}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md ${isDefaultTheme ? 'bg-white text-black border border-gray-200' : ''}`}
                style={!isDefaultTheme ? { 
                  backgroundColor: secondaryColor, 
                  color: btnTextColor, 
                  borderWidth: btnBorderParts.borderWidth,
                  borderStyle: btnBorderParts.borderStyle,
                  borderColor: btnBorderParts.borderColor
                } : {}}
              >
                <CheckCircle size={20} />
                تمت القراءة
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <div 
                  className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border shadow-sm ${isDefaultTheme ? 'bg-gray-50 text-black border-gray-200' : ''}`}
                  style={!isDefaultTheme ? { 
                    backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${secondaryColor}20`, 
                    color: isBlackAndWhite ? '#FFFFFF' : secondaryColor,
                    borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : `${secondaryColor}30`
                  } : {}}
                >
                  <CheckCircle size={20} />
                  انجزت الورد كاملا
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleStartNewWird}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md ${isDefaultTheme ? 'bg-white text-black border border-gray-200' : ''}`}
                    style={!isDefaultTheme ? { 
                      backgroundColor: primaryColor, 
                      color: btnTextColor, 
                      borderWidth: btnBorderParts.borderWidth,
                      borderStyle: btnBorderParts.borderStyle,
                      borderColor: btnBorderParts.borderColor
                    } : {}}
                  >
                    <Plus size={20} />
                    بداية ورد جديد
                  </button>
                  <button 
                    onClick={() => onNavigate('home')}
                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm ${isDefaultTheme ? 'bg-white text-black border border-gray-200' : ''}`}
                    style={isBlackTheme ? {
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      borderColor: '#FFFFFF'
                    } : (!isDefaultTheme ? { 
                      backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${secondaryColor}10`, 
                      color: isBlackAndWhite ? '#FFFFFF' : secondaryColor,
                      borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : `${secondaryColor}30`
                    } : {})}
                  >
                    <Home size={20} />
                    الرئيسية
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
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm ${isDefaultTheme ? 'bg-white text-black border-gray-200' : ''}`}
            style={!isDefaultTheme ? { 
              backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${primaryColor}10`, 
              color: isBlackAndWhite ? '#FFFFFF' : primaryColor,
              borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : `${primaryColor}30`
            } : {}}
          >
            <Settings size={18} />
            تعديل الختمة
          </button>
          <button 
            id="wird-reset-btn"
            onClick={handleReset}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm ${isDefaultTheme ? 'bg-white text-black border-gray-200' : ''}`}
            style={!isDefaultTheme ? { 
              backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : '#ef444410', 
              color: isBlackAndWhite ? '#FFFFFF' : '#ef4444',
              borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : '#ef444430'
            } : {}}
          >
            <RotateCcw size={18} />
            إعادة تعيين
          </button>
        </div>
      </div>
    );
  };

  const renderProfileSelector = () => {
    if (allSettings.length === 0) return null;
    return (
      <div className="relative mb-6">
        <button 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="w-full p-4 rounded-2xl border flex items-center justify-between transition-all"
          style={{ backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--card-bg)', borderColor: isDefaultTheme ? '#e5e7eb' : 'var(--card-border)', color: isDefaultTheme ? '#000000' : 'inherit' }}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDefaultTheme ? 'bg-black/5 text-black' : (isBlackTheme ? 'bg-white text-black' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400')}`}>
              <User size={20} />
            </div>
            <div className="text-right">
              <p className="text-xs opacity-60">المستخدم الحالي</p>
              <p className="font-bold">{settings?.name || 'اختر مستخدماً'}</p>
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
              className="absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" 
              style={{ 
                backgroundColor: isDefaultTheme ? '#ffffff' : (theme.isDark ? '#1a1a1a' : '#ffffff'), 
                borderColor: isDefaultTheme ? '#e5e7eb' : theme.cardBorder,
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
                  style={{ borderColor: isDefaultTheme ? '#f3f4f6' : theme.cardBorder }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <User size={18} className={activeId === profile.id ? (isDefaultTheme ? 'text-black' : (isBlackTheme ? 'text-white' : 'text-emerald-500')) : 'opacity-40'} />
                    <span className={activeId === profile.id ? (isDefaultTheme ? 'font-bold' : (`font-bold ${isBlackTheme ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}`)) : ''}>{profile.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleEditProfile(profile, e)}
                      className={`p-2 rounded-lg transition-colors ${isDefaultTheme ? 'text-gray-600 hover:bg-black/5' : 'text-blue-500 hover:bg-blue-500/10'}`}
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className={`p-2 rounded-lg transition-colors ${isDefaultTheme ? 'text-red-500 hover:bg-red-500/10' : 'text-red-500 hover:bg-red-500/10'}`}
                      title="حذف"
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
                إضافة مستخدم جديد
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm p-8 rounded-[32px] shadow-2xl text-center border"
          style={{ 
            backgroundColor: isDefaultTheme ? '#FFFFFF' : 'var(--modal-bg)', 
            borderColor: isDefaultTheme ? '#f3f4f6' : 'var(--card-border)', 
            color: isDefaultTheme ? '#000000' : 'var(--modal-text)' 
          }}
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm ${isDefaultTheme ? 'bg-red-500/10 text-red-500' : 'bg-red-500/10 text-red-500'}`}>
            <Trash2 size={40} />
          </div>
          <h3 className="text-2xl font-black mb-3">حذف المستخدم؟</h3>
          <p className={`mb-6 ${isDefaultTheme ? 'text-gray-600' : 'opacity-70'}`}>هل أنت متأكد من حذف "{profileToDelete.name}"؟ لا يمكن التراجع عن هذه الخطوة.</p>
          
          {isWirdIncomplete && (
            <div className="p-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center gap-2 text-right">
              <span className="text-lg">⚠️</span>
              تنبيه: لم يتم إكمال ورد اليوم لهذا المستخدم بعد.
            </div>
          )}

          <div className="flex gap-4">
            <button 
              onClick={confirmDeleteProfile}
              className={`flex-1 py-4 rounded-2xl font-bold font-kufi transition-all active:scale-95 shadow-md ${isDefaultTheme ? 'bg-red-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
            >
              تأكيد الحذف
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(null)}
              className={`flex-1 py-4 rounded-2xl font-bold font-kufi transition-all active:scale-95 ${isDefaultTheme ? 'bg-gray-100 text-black' : 'bg-gray-500/10 hover:bg-gray-500/20'}`}
            >
              إلغاء
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
    <div className="h-screen flex flex-col bg-transparent" style={{ fontFamily: theme.font, backgroundColor: isDefaultTheme ? '#FFFFFF' : 'transparent', color: isDefaultTheme ? '#000000' : 'var(--text-color)' }}>
      <header className="app-top-bar">
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-center w-full">
            <div className="absolute left-0">
              <ThemePageLock />
            </div>
            <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
              <span>📅</span>
              الورد اليومي
            </h1>
          </div>
          <p className="app-top-bar__subtitle text-center">تابع ختمتك للقرآن الكريم</p>
        </div>
      </header>

      <main className={`flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col items-center ${isInputFocused ? 'justify-start' : 'justify-center'}`}>
        <div className="w-full max-w-md pb-10">
          {!showSettings && renderProfileSelector()}
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
        <div className="shrink-0 w-full h-32"></div>
      </main>

      {!isInputFocused && <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />}

      {renderDeleteConfirmModal()}

      <ResetConfirmModal 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
      />

      {showSettings || !settings ? (
        <TutorialOverlay tutorialId="daily-wird-setup-tutorial" steps={setupTutorialSteps} />
      ) : (
        <TutorialOverlay tutorialId="daily-wird-progress-tutorial" steps={progressTutorialSteps} />
      )}
    </div>
  );
};

export default DailyWird;
