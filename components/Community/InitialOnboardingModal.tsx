import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Lock, Globe, Check, Eye, EyeOff, Loader2, LogIn, UserPlus } from 'lucide-react';
import { communityService } from '../../services/communityService';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { formatCountryName } from './communityLanguageUtils';

interface InitialOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (pageId: string) => void;
}

const COUNTRIES = [
  'السعودية 🇸🇦',
  'مصر 🇪🇬',
  'الإمارات 🇦🇪',
  'الكويت 🇰🇼',
  'قطر 🇶🇦',
  'عُمان 🇴🇲',
  'البحرين 🇧🇭',
  'الأردن 🇯🇴',
  'فلسطين 🇵🇸',
  'العراق 🇮🇶',
  'سوريا 🇸🇾',
  'لبنان 🇱🇧',
  'اليمن 🇾🇪',
  'المغرب 🇲🇦',
  'الجزائر 🇩🇿',
  'تونس 🇹🇳',
  'ليبيا 🇱🇾',
  'السودان 🇸🇩',
  'موريتانيا 🇲🇷',
  'الصومال 🇸🇴',
  'جيبوتي 🇩🇯',
  'جزر القمر 🇰🇲',
  'تركيا 🇹🇷',
  'إندونيسيا 🇮🇩',
  'ماليزيا 🇲🇾',
  'باكستان 🇵🇰',
  'بنغلاديش 🇧🇩',
  'المملكة المتحدة 🇬🇧',
  'الولايات المتحدة 🇺🇸',
  'فرنسا 🇫🇷',
  'ألمانيا 🇩🇪',
  'كندا 🇨🇦',
  'دولة أخرى 🌍'
];

export const InitialOnboardingModal: React.FC<InitialOnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { language, setLanguage } = useLanguage();
  const { theme, themeKey } = useTheme();
  const isBlackTheme = themeKey === 'deep_black' || theme?.bgColor === '#000000';

  // Modal active language - initialized from language context
  const [modalLang, setModalLang] = useState<'ar' | 'en'>(() => language || 'ar');
  const isEn = modalLang === 'en';

  // Synchronize with external language context updates if any
  useEffect(() => {
    if (language) {
      setModalLang(language);
    }
  }, [language]);

  // Active tab: 'register' or 'restore'
  const [activeTab, setActiveTab] = useState<'register' | 'restore'>('register');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regCountry, setRegCountry] = useState('مصر 🇪🇬');
  const [regPasscode, setRegPasscode] = useState('');
  const [showRegPasscode, setShowRegPasscode] = useState(false);

  // Restore form state (Country selection removed as requested)
  const [restoreUsername, setRestoreUsername] = useState('');
  const [restorePasscode, setRestorePasscode] = useState('');
  const [showRestorePasscode, setShowRestorePasscode] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Language switcher handler
  const handleLanguageChange = (lang: 'ar' | 'en') => {
    setModalLang(lang);
    setLanguage(lang);
    setError('');
  };

  // Handle Cancel action:
  // Shows modal once more on next app launch, but never after 2 cancels or if registered
  const handleCancel = () => {
    try {
      const currentCancelCount = parseInt(localStorage.getItem('initial_onboarding_cancel_count') || '0', 10);
      const newCancelCount = currentCancelCount + 1;
      localStorage.setItem('initial_onboarding_cancel_count', newCancelCount.toString());
      if (newCancelCount >= 2) {
        // User has cancelled twice (initial time + the 1 additional time), so mark permanently completed
        localStorage.setItem('initial_community_onboarding_completed', 'true');
      }
    } catch (e) {}

    onClose();
    onNavigate('home');
  };

  // Handle Register action
  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const username = regUsername.trim();
    const passcode = regPasscode.trim();

    if (!username) {
      setError(isEn ? 'Please enter your username.' : 'يرجى كتابة اسم المستخدم.');
      return;
    }
    if (username.length < 2) {
      setError(isEn ? 'Username must be at least 2 characters.' : 'يجب أن يكون اسم المستخدم حرفين على الأقل.');
      return;
    }
    if (!passcode) {
      setError(isEn ? 'Please enter a PIN / Password.' : 'يرجى كتابة الرقم السري.');
      return;
    }
    if (passcode.length < 4) {
      setError(isEn ? 'Password/PIN must be at least 4 digits/characters.' : 'يجب أن يتكون الرقم السري من 4 خانات على الأقل.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await communityService.createNewAccount(
        username,
        regCountry || 'دولة أخرى 🌍',
        '',
        '',
        passcode
      );

      try {
        localStorage.setItem('initial_community_onboarding_completed', 'true');
      } catch (e) {}

      // Keep chosen language active
      setLanguage(modalLang);
      onClose();
      onNavigate('home');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err?.message || (isEn ? 'Failed to create account. Please try again.' : 'تعذر إنشاء الحساب، يرجى المحاولة مرة أخرى.'));
    } finally {
      setLoading(false);
    }
  };

  // Handle Restore action (country not needed, verified via username/code + passcode)
  const handleRestore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const username = restoreUsername.trim();
    const passcode = restorePasscode.trim();

    if (!username) {
      setError(isEn ? 'Please enter your username or account code.' : 'يرجى إدخال اسم المستخدم أو كود الحساب.');
      return;
    }
    if (!passcode) {
      setError(isEn ? 'Please enter your password / PIN.' : 'يرجى كتابة الرقم السري.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await communityService.restoreAccount(
        username,
        passcode
      );

      try {
        localStorage.setItem('initial_community_onboarding_completed', 'true');
      } catch (e) {}

      // Keep chosen language active
      setLanguage(modalLang);
      onClose();
      onNavigate('home');
    } catch (err: any) {
      console.error('Restore failed:', err);
      setError(err?.message || (isEn ? 'Account not found or invalid PIN.' : 'تعذر استعادة الحساب، تأكد من صحة البيانات.'));
    } finally {
      setLoading(false);
    }
  };

  const primaryAccent = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const cardBg = isBlackTheme ? '#111111' : (theme.cardBg || '#ffffff');
  const textColor = isBlackTheme ? '#ffffff' : (theme.textColor || '#1f2937');
  const inputBg = isBlackTheme ? '#1e1e1e' : 'rgba(0, 0, 0, 0.04)';
  const borderColor = isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)';

  return (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-fadeIn"
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-sm rounded-[2rem] p-5 sm:p-6 shadow-2xl border flex flex-col my-auto"
        style={{ 
          backgroundColor: cardBg,
          color: textColor,
          borderColor: borderColor
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: App Name */}
        <div className="text-center mb-3">
          <h2 className="text-xl sm:text-2xl font-black font-kufi tracking-tight mb-1" style={{ color: primaryAccent }}>
            {isEn ? 'Mushaf Ahmed & Layla' : 'مصحف أحمد وليلى'}
          </h2>
          <p className="text-[11px] font-bold opacity-70">
            {isEn ? 'Faith Community Registration' : 'التسجيل في مجتمع التواصل'}
          </p>
        </div>

        {/* Language Selection Buttons under App Name */}
        <div className="flex items-center justify-center gap-2 mb-4 p-1 rounded-2xl bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/15">
          <button
            type="button"
            onClick={() => handleLanguageChange('ar')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              !isEn 
                ? 'shadow-md scale-100' 
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: !isEn ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
              color: !isEn ? (isBlackTheme ? '#000000' : '#FFFFFF') : undefined
            }}
          >
            {!isEn && <Check size={14} className="stroke-[3]" />}
            <span>العربية</span>
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              isEn 
                ? 'shadow-md scale-100' 
                : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'
            }`}
            style={{
              backgroundColor: isEn ? (isBlackTheme ? '#FFFFFF' : primaryAccent) : 'transparent',
              color: isEn ? (isBlackTheme ? '#000000' : '#FFFFFF') : undefined
            }}
          >
            {isEn && <Check size={14} className="stroke-[3]" />}
            <span>English</span>
          </button>
        </div>

        {/* Tabs: Register / Restore */}
        <div className="grid grid-cols-2 gap-1 mb-4 border-b border-black/10 dark:border-white/10 pb-2">
          <button
            type="button"
            onClick={() => { setActiveTab('register'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'register' 
                ? 'border-emerald-500' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ 
              borderColor: activeTab === 'register' ? primaryAccent : 'transparent',
              color: activeTab === 'register' ? primaryAccent : undefined
            }}
          >
            <UserPlus size={15} />
            <span>{isEn ? 'Register' : 'تسجيل جديد'}</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('restore'); setError(''); }}
            className={`py-2 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'restore' 
                ? 'border-emerald-500' 
                : 'border-transparent opacity-60 hover:opacity-100'
            }`}
            style={{ 
              borderColor: activeTab === 'restore' ? primaryAccent : 'transparent',
              color: activeTab === 'restore' ? primaryAccent : undefined
            }}
          >
            <LogIn size={15} />
            <span>{isEn ? 'Restore Account' : 'استعادة الحساب'}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}

        {/* Tab 1: New Registration (with Country Selection) */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-black mb-1 opacity-90 flex items-center gap-1">
                <User size={13} style={{ color: primaryAccent }} />
                <span>{isEn ? 'Username' : 'اسم المستخدم'}</span>
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder={isEn ? 'Enter your name or nickname...' : 'اكتب اسمك أو لقبك هنا...'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ 
                  backgroundColor: inputBg, 
                  borderColor: borderColor,
                  color: textColor
                }}
                disabled={loading}
                autoFocus
              />
            </div>

            {/* Country Selection Section */}
            <div>
              <label className="block text-xs font-black mb-1 opacity-90 flex items-center gap-1">
                <Globe size={13} style={{ color: primaryAccent }} />
                <span>{isEn ? 'Country' : 'الدولة'}</span>
              </label>
              <select
                value={regCountry}
                onChange={(e) => setRegCountry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                style={{ 
                  backgroundColor: inputBg, 
                  borderColor: borderColor,
                  color: textColor
                }}
                disabled={loading}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c} className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    {formatCountryName(c, isEn)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black mb-1 opacity-90 flex items-center gap-1">
                <Lock size={13} style={{ color: primaryAccent }} />
                <span>{isEn ? 'Password / PIN' : 'الرقم السري'}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRegPasscode ? 'text' : 'password'}
                  value={regPasscode}
                  onChange={(e) => setRegPasscode(e.target.value)}
                  placeholder={isEn ? 'Enter 4-12 digits/letters PIN...' : 'أدخل رقم سري لحماية حسابك (4-12 خانة)...'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ 
                    backgroundColor: inputBg, 
                    borderColor: borderColor,
                    color: textColor
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPasscode(!showRegPasscode)}
                  className={`absolute ${isEn ? 'right-3' : 'left-3'} opacity-60 hover:opacity-100 p-1 cursor-pointer`}
                  title={showRegPasscode ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'Show' : 'إظهار')}
                >
                  {showRegPasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Action Buttons: Register & Cancel */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent,
                  color: isBlackTheme ? '#000000' : '#FFFFFF'
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} className="stroke-[3]" />
                    <span>{isEn ? 'Register' : 'تسجيل'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border opacity-80 hover:opacity-100 active:scale-95 transition-all cursor-pointer text-center"
                style={{
                  borderColor: borderColor,
                  backgroundColor: 'transparent',
                  color: textColor
                }}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Restore Account (Country section deleted) */}
        {activeTab === 'restore' && (
          <form onSubmit={handleRestore} className="space-y-3">
            <div>
              <label className="block text-xs font-black mb-1 opacity-90 flex items-center gap-1">
                <User size={13} style={{ color: primaryAccent }} />
                <span>{isEn ? 'Username or Account Code' : 'اسم المستخدم أو كود الحساب'}</span>
              </label>
              <input
                type="text"
                value={restoreUsername}
                onChange={(e) => setRestoreUsername(e.target.value)}
                placeholder={isEn ? 'Username or MQ-XXXXX code...' : 'اسم المستخدم أو كود MQ-XXXXX...'}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                style={{ 
                  backgroundColor: inputBg, 
                  borderColor: borderColor,
                  color: textColor
                }}
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-black mb-1 opacity-90 flex items-center gap-1">
                <Lock size={13} style={{ color: primaryAccent }} />
                <span>{isEn ? 'Password / PIN' : 'الرقم السري'}</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type={showRestorePasscode ? 'text' : 'password'}
                  value={restorePasscode}
                  onChange={(e) => setRestorePasscode(e.target.value)}
                  placeholder={isEn ? 'Your account password / PIN...' : 'الرقم السري الخاص بحسابك...'}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-colors outline-none focus:ring-2 focus:ring-emerald-500"
                  style={{ 
                    backgroundColor: inputBg, 
                    borderColor: borderColor,
                    color: textColor
                  }}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowRestorePasscode(!showRestorePasscode)}
                  className={`absolute ${isEn ? 'right-3' : 'left-3'} opacity-60 hover:opacity-100 p-1 cursor-pointer`}
                  title={showRestorePasscode ? (isEn ? 'Hide' : 'إخفاء') : (isEn ? 'Show' : 'إظهار')}
                >
                  {showRestorePasscode ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Action Buttons: Restore & Cancel */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                style={{
                  backgroundColor: isBlackTheme ? '#FFFFFF' : primaryAccent,
                  color: isBlackTheme ? '#000000' : '#FFFFFF'
                }}
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <LogIn size={16} />
                    <span>{isEn ? 'Restore' : 'استعادة الحساب'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm border opacity-80 hover:opacity-100 active:scale-95 transition-all cursor-pointer text-center"
                style={{
                  borderColor: borderColor,
                  backgroundColor: 'transparent',
                  color: textColor
                }}
              >
                {isEn ? 'Cancel' : 'إلغاء'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default InitialOnboardingModal;
