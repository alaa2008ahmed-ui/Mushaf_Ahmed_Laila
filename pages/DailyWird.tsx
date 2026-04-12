import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';
import { CheckCircle, BookOpen, RotateCcw, Play, Settings, X, User, Plus, Trash2, ChevronDown, Edit2 } from 'lucide-react';
import BottomBar from '../components/BottomBar';
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

const DailyWird: React.FC<{ onBack: () => void; onNavigate: (page: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
  const { theme, themeKey } = useTheme();
  const isBlackAndWhite = themeKey === 'black_and_white';
  const primaryColor = isBlackAndWhite ? '#FFFFFF' : theme.palette[0];
  const secondaryColor = isBlackAndWhite ? '#FFFFFF' : (theme.palette[1] || theme.palette[0]);
  const btnTextColor = isBlackAndWhite ? '#000000' : '#FFFFFF';

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
      setAllSettings(parsed.profiles || []);
      setActiveId(parsed.activeId || (parsed.profiles?.length > 0 ? parsed.profiles[0].id : null));
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

  const dailyWirdTutorialSteps: TutorialStep[] = [
    {
      id: 'wird-welcome',
      text: 'الورد اليومي: ميزة جديدة لمساعدتك على ختم القرآن الكريم بانتظام حسب خطتك الخاصة.',
      position: { top: '20%' },
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-progress',
      text: 'نسبة الإنجاز: تابع تقدمك اليومي ومدى اقترابك من ختم القرآن.',
      position: { top: '30%' },
      arrow: 'up',
      selector: '#wird-progress-container',
      icon: <CheckCircle className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-today',
      text: 'ورد اليوم: يعرض لك الصفحات المطلوب قراءتها اليوم. يمكنك الضغط لفتح المصحف مباشرة.',
      position: { top: '40%' },
      arrow: 'up',
      selector: '#wird-today-container',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'wird-actions',
      text: 'إدارة الختمة: يمكنك تعديل الخطة، إضافة مستخدمين آخرين، أو إعادة تعيين الختمة من هنا.',
      position: { bottom: '150px' },
      arrow: 'down',
      selector: '#wird-actions-container',
      icon: <Play className="w-8 h-8 text-white" />
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
    <div className="p-4 rounded-2xl shadow-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
      <h2 className="text-xl font-bold mb-4 text-center">{settings ? 'تعديل الختمة' : 'إعداد ختمة جديدة'}</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2 font-semibold">اسم المستخدم / الختمة:</label>
          <input 
            type="text"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            className="w-full border rounded-xl p-3 text-right focus:outline-none focus:border-green-500"
            style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
            placeholder="مثال: أحمد، ختمة رمضان..."
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">طريقة الختمة:</label>
          <div className="flex gap-4">
            <button 
              onClick={() => setTempMode('days')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'days' ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              حسب الأيام
            </button>
            <button 
              onClick={() => setTempMode('pages')}
              className={`flex-1 py-3 rounded-xl border-2 transition-all ${tempMode === 'pages' ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-400' : 'border-gray-300 dark:border-gray-600'}`}
            >
              حسب الصفحات
            </button>
          </div>
        </div>


        <div>
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
            style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)', borderColor: 'var(--card-border)', color: 'var(--text-color)' }}
            placeholder={tempMode === 'days' ? '30' : '20'}
          />
        </div>

        {settings && settings.completedDays.length > 0 && (
          <div className="p-4 rounded-xl border-2 border-dashed" style={{ borderColor: theme.cardBorder }}>
            <label className="block mb-3 font-bold text-sm text-emerald-600 dark:text-emerald-400">طريقة احتساب المتبقي:</label>
            <div className="space-y-3">
              <button 
                onClick={() => setCalcMethod('remaining')}
                className={`w-full p-3 rounded-xl text-right text-sm flex items-center justify-between border transition-all ${calcMethod === 'remaining' ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span>خطة جديدة للمتبقي (العدد المدخل هو للمستقبل)</span>
                <div className={`w-4 h-4 rounded-full border-2 ${calcMethod === 'remaining' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'}`} />
              </button>
              <button 
                onClick={() => setCalcMethod('total')}
                className={`w-full p-3 rounded-xl text-right text-sm flex items-center justify-between border transition-all ${calcMethod === 'total' ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-gray-700'}`}
              >
                <span>تعديل الخطة الحالية (العدد المدخل هو الإجمالي)</span>
                <div className={`w-4 h-4 rounded-full border-2 ${calcMethod === 'total' ? 'border-emerald-500 bg-emerald-500' : 'border-gray-400'}`} />
              </button>
            </div>
            <p className="text-[10px] mt-2 opacity-60 leading-tight">
              * سيتم البدء من الصفحة التالية لآخر صفحة قرأتها.
            </p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button 
            onClick={handleStart}
            className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play size={24} />
            {settings ? 'حفظ' : 'ابدأ الختمة'}
          </button>
          {(settings || allSettings.length > 0) && (
            <button 
              onClick={handleCancelEdit}
              className="py-4 px-6 bg-gray-500 hover:bg-gray-400 text-white rounded-xl font-bold text-lg flex items-center justify-center transition-colors"
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
        <div id="wird-progress-container" className="rounded-2xl p-4 shadow-lg border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex justify-between mb-1">
            <span className="font-bold text-sm">نسبة الإنجاز</span>
            <span className="font-bold text-green-500 dark:text-green-400 text-sm">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            />
          </div>
          <div className="flex justify-between mt-1 text-xs opacity-80">
            <span>اليوم {settings.currentDay} من {totalDays}</span>
            <span>{settings.completedDays.length} يوم مكتمل</span>
          </div>
        </div>

        {/* Current Wird */}
        <div id="wird-today-container" className="rounded-2xl p-4 shadow-lg border text-center" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          <h3 className="text-lg font-bold mb-3 text-emerald-600 dark:text-emerald-400">ورد اليوم ({settings.currentDay})</h3>
          
          <div className="flex justify-center items-center gap-3 mb-4">
            {hasPages ? (
              <>
                <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                  <p className="text-xs opacity-80 mb-1">من صفحة</p>
                  <p className="text-2xl font-bold">{startPage}</p>
                </div>
                <span className="text-xl opacity-50">-</span>
                <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
                  <p className="text-xs opacity-80 mb-1">إلى صفحة</p>
                  <p className="text-2xl font-bold">{endPage}</p>
                </div>
              </>
            ) : (
              <div className="p-3 rounded-xl flex-1" style={{ backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)' }}>
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
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
                style={{ backgroundColor: primaryColor, color: btnTextColor, border: theme.btnBorder || 'none' }}
              >
                <BookOpen size={20} />
                {canContinue ? `تكملة الورد (صفحة ${settings.lastPage})` : 'افتح المصحف للقراءة'}
              </button>
            )}

            {!isCompleted ? (
              <button 
                onClick={markDayCompleted}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm shadow-md"
                style={{ backgroundColor: secondaryColor, color: btnTextColor, border: theme.btnBorder || 'none' }}
              >
                <CheckCircle size={20} />
                تمت القراءة
              </button>
            ) : (
              <div 
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 text-sm border shadow-sm"
                style={{ 
                  backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${secondaryColor}20`, 
                  color: isBlackAndWhite ? '#FFFFFF' : secondaryColor,
                  borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : `${secondaryColor}30`
                }}
              >
                <CheckCircle size={20} />
                أنجزت ورد اليوم، بارك الله فيك!
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleEdit}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm"
            style={{ 
              backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : `${primaryColor}10`, 
              color: isBlackAndWhite ? '#FFFFFF' : primaryColor,
              borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : `${primaryColor}30`
            }}
          >
            <Settings size={18} />
            تعديل الختمة
          </button>
          <button 
            onClick={handleReset}
            className="flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors text-sm border shadow-sm"
            style={{ 
              backgroundColor: isBlackAndWhite ? 'rgba(255,255,255,0.1)' : '#ef444410', 
              color: isBlackAndWhite ? '#FFFFFF' : '#ef4444',
              borderColor: isBlackAndWhite ? 'rgba(255,255,255,0.2)' : '#ef444430'
            }}
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
          style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
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
                backgroundColor: theme.isDark ? '#1a1a1a' : '#ffffff', 
                borderColor: theme.cardBorder 
              }}
            >
              {allSettings.map(profile => (
                <div 
                  key={profile.id}
                  onClick={() => {
                    setActiveId(profile.id);
                    setShowProfileMenu(false);
                  }}
                  className={`p-4 flex items-center justify-between border-b last:border-0 cursor-pointer transition-colors ${activeId === profile.id ? 'bg-emerald-500/10' : 'hover:bg-gray-500/5'}`}
                  style={{ borderColor: theme.cardBorder }}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <User size={18} className={activeId === profile.id ? 'text-emerald-500' : 'opacity-40'} />
                    <span className={activeId === profile.id ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>{profile.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={(e) => handleEditProfile(profile, e)}
                      className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"
                      title="تعديل"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteProfile(profile.id, e)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
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
                className="w-full p-4 flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-500/5 transition-colors"
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
          className="w-full max-w-sm p-6 rounded-3xl shadow-2xl text-center border"
          style={{ backgroundColor: 'var(--modal-bg)', borderColor: 'var(--card-border)', color: 'var(--modal-text)' }}
        >
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">حذف المستخدم؟</h3>
          <p className="opacity-70 mb-4">هل أنت متأكد من حذف "{profileToDelete.name}"؟ لا يمكن التراجع عن هذه الخطوة.</p>
          
          {isWirdIncomplete && (
            <div className="p-3 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-sm font-bold flex items-center gap-2 text-right">
              <span className="text-lg">⚠️</span>
              تنبيه: لم يتم إكمال ورد اليوم لهذا المستخدم بعد.
            </div>
          )}

          <div className="flex gap-3">
            <button 
              onClick={confirmDeleteProfile}
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-colors"
            >
              تأكيد الحذف
            </button>
            <button 
              onClick={() => setShowDeleteConfirm(null)}
              className="flex-1 py-3 bg-gray-500/10 hover:bg-gray-500/20 rounded-xl font-bold transition-colors"
            >
              إلغاء
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-transparent" style={{ fontFamily: theme.font, color: 'var(--text-color)' }}>
      <header className="app-top-bar shrink-0 relative z-10">
        <div className="app-top-bar__inner flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="app-top-bar__title text-2xl font-kufi flex items-center justify-center gap-2">
              <span className="text-green-500 dark:text-green-400">📅</span>
              الورد اليومي
            </h1>
            <p className="app-top-bar__subtitle">تابع ختمتك للقرآن الكريم</p>
          </div>
        </div>
      </header>

      <main className={`flex-1 min-h-0 overflow-y-auto p-4 flex flex-col items-center ${isInputFocused ? 'justify-start' : 'justify-center'}`}>
        <div className="w-full max-w-md pb-10">
          {!showSettings && renderProfileSelector()}
          {showSettings || !settings ? renderSettings() : renderProgress()}
        </div>
      </main>

      {!isInputFocused && <BottomBar onHomeClick={() => onNavigate('more-menu')} onThemesClick={() => {}} showThemes={false} />}

      {renderDeleteConfirmModal()}

      <ResetConfirmModal 
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={confirmReset}
      />

      <TutorialOverlay tutorialId="daily-wird-tutorial" steps={dailyWirdTutorialSteps} />
    </div>
  );
};

export default DailyWird;
