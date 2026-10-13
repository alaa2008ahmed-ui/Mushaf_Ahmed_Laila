import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Check, Sparkles, ArrowRight, Camera as CameraIcon, Trash2, 
  Loader2, KeyRound, Copy, LogIn, Lock, CheckCircle2, Shield
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { communityService, CommunityUser } from '../../services/communityService';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { AvatarCropperModal } from './AvatarCropperModal';
import BottomBar from '../BottomBar';
import { useTheme } from '../../context/ThemeContext';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isInitialPrompt?: boolean;
  onBackToApps?: () => void;
}

const COUNTRIES = [
  // الدول العربية (22 دولة)
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
  // الدول الإسلامية
  'تركيا 🇹🇷',
  'إندونيسيا 🇮🇩',
  'ماليزيا 🇲🇾',
  'باكستان 🇵🇰',
  'بنغلاديش 🇧🇩',
  'إيران 🇮🇷',
  'أفغانستان 🇦🇫',
  'نيجيريا 🇳🇬',
  'السنغال 🇸🇳',
  'تشاد 🇹🇩',
  'مالي 🇲🇱',
  'النيجر 🇳🇪',
  'غينيا 🇬🇳',
  'كوت ديفوار 🇨🇮',
  'بوركينا فاسو 🇧🇫',
  'سيراليون 🇸🇱',
  'غامبيا 🇬🇲',
  'كازاخستان 🇰🇿',
  'أوزبكستان 🇺🇿',
  'تركمانستان 🇹🇲',
  'قيرغيزستان 🇰🇬',
  'طاجيكستان 🇹🇯',
  'أذربيجان 🇦🇿',
  'ألبانيا 🇦🇱',
  'البوسنة والهرسك 🇧🇦',
  'كوسوفو 🇽🇰',
  'بروناي 🇧🇳',
  'المالديف 🇲🇻',
  // دول يتواجد بها الإسلام ومجتمعات مسلمة
  'الهند 🇮🇳',
  'المملكة المتحدة 🇬🇧',
  'فرنسا 🇫🇷',
  'ألمانيا 🇩🇪',
  'الولايات المتحدة 🇺🇸',
  'كندا 🇨🇦',
  'أستراليا 🇦🇺',
  'روسيا 🇷🇺',
  'الصين 🇨🇳',
  'السويد 🇸🇪',
  'هولندا 🇳🇱',
  'بلجيكا 🇧🇪',
  'إيطاليا 🇮🇹',
  'إسبانيا 🇪🇸',
  'سويسرا 🇨🇭',
  'النمسا 🇦🇹',
  'النرويج 🇳🇴',
  'الدنمارك 🇩🇰',
  'اليابان 🇯🇵',
  'كوريا الجنوبية 🇰🇷',
  'البرازيل 🇧🇷',
  'الأرجنتين 🇦🇷',
  'جنوب إفريقيا 🇿🇦',
  'دولة أخرى / كتابة يدوية ✍️'
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
];

const compressAvatar = (dataUrl: string, maxDim = 128, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl || PRESET_AVATARS[0]);
    }
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          resolve(PRESET_AVATARS[0]);
        }
      } else {
        resolve(PRESET_AVATARS[0]);
      }
    };
    img.onerror = () => resolve(PRESET_AVATARS[0]);
    img.src = dataUrl;
  });
};

const UsernameModal: React.FC<UsernameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  onBackToApps 
}) => {
  const { theme, themeKey } = useTheme();
  const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
  const isDeepBlack = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
  const cardBorderColor = isDefaultTheme 
    ? '#000000' 
    : (isDeepBlack 
        ? '#FFFFFF' 
        : (theme.palette?.[0] || theme.accent || '#000000'));
  const cardBorder = cardBorderColor;
  const isBlackTheme = isDeepBlack;
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#10b981');
  const primaryTextColor = isBlackTheme ? '#000000' : (theme.btnText || '#FFFFFF');
  const cardBg = isBlackTheme 
    ? '#111111' 
    : (theme.isGlass ? 'rgba(255, 255, 255, 0.15)' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff')));
  const secondaryBg = isBlackTheme 
    ? '#1a1a1a' 
    : (theme.isDark ? '#0f172a' : '#f8fafc');

  const [currentUser, setCurrentUser] = useState<CommunityUser>(() => communityService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<'profile' | 'create_new' | 'restore'>('profile');
  
  // Profile edit fields
  const [username, setUsername] = useState(currentUser.username || '');
  const [country, setCountry] = useState(() => {
    if (!currentUser.country) return '';
    return COUNTRIES.includes(currentUser.country) ? currentUser.country : 'دولة أخرى / كتابة يدوية ✍️';
  });
  const [customCountry, setCustomCountry] = useState(() => {
    if (!currentUser.country) return '';
    return COUNTRIES.includes(currentUser.country) ? '' : currentUser.country;
  });
  const [bio, setBio] = useState(currentUser.bio || '');
  const [avatarUrl, setAvatarUrl] = useState<string>(currentUser.avatarUrl || PRESET_AVATARS[0]);
  const [passcode, setPasscode] = useState(currentUser.passcode || '');

  // New account fields
  const [newUsername, setNewUsername] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newCustomCountry, setNewCustomCountry] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newAvatarUrl, setNewAvatarUrl] = useState<string>(PRESET_AVATARS[1]);
  const [newPasscode, setNewPasscode] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  
  // Restore fields
  const [restoreCode, setRestoreCode] = useState('');
  const [restorePasscode, setRestorePasscode] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  
  const [copiedCode, setCopiedCode] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Avatar cropping modal state
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropperImgSrc, setCropperImgSrc] = useState('');
  const [cropperTargetIsNew, setCropperTargetIsNew] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Focus navigation refs for mobile keyboard Next ("التالي") and Done ("تم")
  const customCountryRef = useRef<HTMLInputElement>(null);
  const bioRef = useRef<HTMLInputElement>(null);
  const passcodeRef = useRef<HTMLInputElement>(null);

  const newCustomCountryRef = useRef<HTMLInputElement>(null);
  const newBioRef = useRef<HTMLInputElement>(null);
  const newPasscodeRef = useRef<HTMLInputElement>(null);

  const restorePasscodeRef = useRef<HTMLInputElement>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const u = communityService.getCurrentUser();
    setCurrentUser(u);
    if (u.username) {
      setUsername(u.username);
      setActiveTab('profile');
    } else {
      setActiveTab('create_new');
    }
    if (u.country) {
      if (COUNTRIES.includes(u.country)) {
        setCountry(u.country);
        setCustomCountry('');
      } else {
        setCountry('دولة أخرى / كتابة يدوية ✍️');
        setCustomCountry(u.country);
      }
    } else {
      setCountry('');
      setCustomCountry('');
    }
    if (u.bio) setBio(u.bio);
    setAvatarUrl(u.avatarUrl || PRESET_AVATARS[0]);
    if (u.passcode) setPasscode(u.passcode);

    const handleBackgroundUserUpdate = (e: any) => {
      const freshUser = communityService.getCurrentUser();
      setCurrentUser(freshUser);
      // DO NOT reset activeTab so the user can stay on "استعادة حساب" or "إنشاء حساب جديد" without being interrupted
    };

    window.addEventListener('community_user_updated', handleBackgroundUserUpdate);
    return () => window.removeEventListener('community_user_updated', handleBackgroundUserUpdate);
  }, [isOpen]);

  // Handle hardware back button when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const unregister = registerBackInterceptor(() => {
      if (cropperOpen) {
        setCropperOpen(false);
        setCropperImgSrc('');
        return true;
      }
      if (communityService.isProfileComplete()) {
        if (onSaved) onSaved();
        else onClose();
      } else {
        if (onBackToApps) onBackToApps();
        else onClose();
      }
      return true;
    });

    return () => {
      unregister();
    };
  }, [isOpen, onBackToApps, onClose, onSaved, cropperOpen]);

  const handleCopyCode = async () => {
    if (!currentUser.accountCode) return;
    try {
      await navigator.clipboard.writeText(currentUser.accountCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 15 ميجابايت');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCropperImgSrc(reader.result);
          setCropperTargetIsNew(isNew);
          setCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handlePickImage = async (isNew: boolean) => {
    try {
      if (Capacitor.isNativePlatform()) {
        try {
          const image = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos
          });

          if (image && image.dataUrl) {
            setCropperImgSrc(image.dataUrl);
            setCropperTargetIsNew(isNew);
            setCropperOpen(true);
            return;
          }
        } catch (camErr: any) {
          const msg = (camErr?.message || '').toLowerCase();
          if (msg.includes('cancel') || msg.includes('user cancelled')) {
            return;
          }
          console.warn('Native camera picker failed, falling back to file input:', camErr);
        }
      }

      if (isNew) {
        newFileInputRef.current?.click();
      } else {
        fileInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Error picking image:', err);
      if (isNew) {
        newFileInputRef.current?.click();
      } else {
        fileInputRef.current?.click();
      }
    }
  };

  const handleCropComplete = async (croppedDataUrl: string) => {
    try {
      const compressed = await compressAvatar(croppedDataUrl, 180, 0.8);
      if (cropperTargetIsNew) {
        setNewAvatarUrl(compressed);
      } else {
        setAvatarUrl(compressed);
      }
    } catch (e) {
      if (cropperTargetIsNew) setNewAvatarUrl(croppedDataUrl);
      else setAvatarUrl(croppedDataUrl);
    }
    setCropperOpen(false);
    setCropperImgSrc('');
  };

  const handleSaveProfile = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!username.trim() || username.trim().length < 2) {
      setError('يرجى إدخال اسم المستخدم أو اللقب المبارك (حرفين على الأقل)');
      return;
    }

    let finalCountry = country;
    if (country === 'دولة أخرى / كتابة يدوية ✍️') {
      finalCountry = customCountry.trim();
    }
    const finalAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : PRESET_AVATARS[0];

    setIsSaving(true);
    setError('');
    setSuccessMsg('');
    try {
      await communityService.saveCurrentUser(username, finalCountry, bio, finalAvatar, passcode);
      if (!communityService.hasUserAnyConversations()) {
        communityService.setActiveTab('users');
      } else {
        communityService.setActiveTab('chats');
      }
      setSuccessMsg('تم حفظ البيانات بنجاح! جاري الدخول للدردشة...');
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 400);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || 'حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewAccount = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 2) {
      setError('يرجى إدخال اسم المستخدم الجديد (حرفين على الأقل)');
      return;
    }

    let finalCountry = newCountry;
    if (newCountry === 'دولة أخرى / كتابة يدوية ✍️') {
      finalCountry = newCustomCountry.trim();
    }
    const finalAvatar = newAvatarUrl && newAvatarUrl.trim() ? newAvatarUrl.trim() : PRESET_AVATARS[1];

    setIsCreatingNew(true);
    setError('');
    setSuccessMsg('');
    try {
      const created = await communityService.createNewAccount(newUsername, finalCountry, newBio, finalAvatar, newPasscode);
      communityService.setActiveTab('users');
      setCurrentUser(created);
      setUsername(created.username);
      if (created.country) {
        if (COUNTRIES.includes(created.country)) {
          setCountry(created.country);
          setCustomCountry('');
        } else {
          setCountry('دولة أخرى / كتابة يدوية ✍️');
          setCustomCountry(created.country);
        }
      } else {
        setCountry('');
        setCustomCountry('');
      }
      setBio(created.bio || '');
      setAvatarUrl(created.avatarUrl || PRESET_AVATARS[0]);
      setPasscode(created.passcode || '');

      setSuccessMsg(`تم إنشاء حسابك الجديد بنجاح يا ${created.username}! كودك هو (${created.accountCode})`);
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 500);
    } catch (err: any) {
      console.error('Create new account error:', err);
      setError(err?.message || 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى');
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleRestoreAccount = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const cleanCode = restoreCode.trim();
    if (!cleanCode) {
      setError('يرجى إدخال اسم المستخدم بالكامل أو كود الحساب (مثل MQ-XXXXX)');
      return;
    }

    setIsRestoring(true);
    setError('');
    setSuccessMsg('');

    try {
      const restored = await communityService.restoreAccount(cleanCode, restorePasscode);
      setCurrentUser(restored);
      setUsername(restored.username || '');
      if (restored.country) {
        if (COUNTRIES.includes(restored.country)) {
          setCountry(restored.country);
          setCustomCountry('');
        } else {
          setCountry('دولة أخرى / كتابة يدوية ✍️');
          setCustomCountry(restored.country);
        }
      } else {
        setCountry('');
        setCustomCountry('');
      }
      setBio(restored.bio || '');
      setAvatarUrl(restored.avatarUrl || PRESET_AVATARS[0]);
      setPasscode(restored.passcode || '');
      
      setSuccessMsg(`مرحباً بك مجدداً يا ${restored.username}! تم استعادة حسابك بنجاح.`);
      
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 500);
    } catch (err: any) {
      setError(err?.message || 'تعذر استعادة الحساب. تأكد من صحة الاسم أو الكود ورمز المرور.');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleSwitchAccount = () => {
    communityService.logoutAccount();
    const fresh = communityService.getCurrentUser();
    setCurrentUser(fresh);
    setUsername('');
    setCountry('');
    setCustomCountry('');
    setNewCountry('');
    setNewCustomCountry('');
    setBio('');
    setAvatarUrl(PRESET_AVATARS[0]);
    setPasscode('');
    setActiveTab('create_new');
    setError('');
    setSuccessMsg('تم تسجيل الخروج بنجاح. يمكنك الآن كتابة اسمك الجديد وبدء التراسل فوراً.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (!isOpen) return null;

  const handleBackAction = () => {
    if (communityService.isProfileComplete()) {
      if (onSaved) {
        onSaved();
      } else {
        onClose();
      }
    } else {
      if (onBackToApps) {
        onBackToApps();
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      className="h-screen max-h-screen h-[100dvh] w-full flex flex-col overflow-y-auto overscroll-contain transition-colors" 
      dir="rtl"
      style={{ 
        backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#020617' : '#f8fafc')),
        color: theme.textColor || (theme.isDark || isBlackTheme ? '#ffffff' : '#0f172a'),
        fontFamily: theme.font,
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 3.75rem + 1cm)'
      }}
    >
      {/* Full Screen Scrollable Page Body */}
      <div className="flex-1 w-full px-2 sm:px-3 py-3">

        {/* Mode Switch Tabs */}
          <div 
            className="flex items-center gap-1 p-1 rounded-2xl mb-4"
            style={{ 
              backgroundColor: secondaryBg, 
              borderColor: cardBorder, 
              borderWidth: '1.5px', 
              borderStyle: 'solid' 
            }}
          >
            {currentUser.username ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('profile');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  style={activeTab === 'profile' ? {
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  } : {
                    color: theme.textColor,
                    opacity: 0.75
                  }}
                >
                  <span>تعديل حسابي</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('create_new');
                    setError('');
                    setSuccessMsg('');
                  }}
                  className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                  style={activeTab === 'create_new' ? {
                    backgroundColor: primaryColor,
                    color: primaryTextColor,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  } : {
                    color: theme.textColor,
                    opacity: 0.75
                  }}
                >
                  <span>حساب جديد</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('create_new');
                  setError('');
                  setSuccessMsg('');
                }}
                className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                style={activeTab === 'create_new' ? {
                  backgroundColor: primaryColor,
                  color: primaryTextColor,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                } : {
                  color: theme.textColor,
                  opacity: 0.75
                }}
              >
                <span>إنشاء حساب جديد</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setActiveTab('restore');
                setError('');
                setSuccessMsg('');
              }}
              className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
              style={activeTab === 'restore' ? {
                backgroundColor: primaryColor,
                color: primaryTextColor,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              } : {
                color: theme.textColor,
                opacity: 0.75
              }}
            >
              <span>استعادة حساب</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div 
              className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-bold text-center"
              style={{ borderColor: cardBorder, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              {error}
            </div>
          )}

          {successMsg && (
            <div 
              className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-1.5"
              style={{ borderColor: cardBorder, borderWidth: '1.5px', borderStyle: 'solid' }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: Edit Current Profile */}
          {activeTab === 'profile' && currentUser.username && (
            <div>
              {/* Account Code Showcase Card */}
              <div 
                className="mb-4 p-3.5 rounded-2xl shadow-xs"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderWidth: '1.5px',
                  borderStyle: 'solid'
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold block mb-0.5" style={{ color: theme.textColor, opacity: 0.8 }}>
                      كود حسابك الدائم (للدخول من أي هاتف آخر):
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base sm:text-lg font-extrabold tracking-wider" style={{ color: primaryColor }}>
                        {currentUser.accountCode || 'MQ-XXXXX'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryTextColor
                    }}
                  >
                    {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                    <span>{copiedCode ? 'تم النسخ!' : 'نسخ الكود'}</span>
                  </button>
                </div>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: theme.textColor, opacity: 0.7 }}>
                  احفظ هذا الكود. عند فتح التطبيق من أي جهاز آخر، ادخل الكود لاستعادة اسمك ومحادثاتك فوراً.
                </p>
              </div>

              {/* Profile Details Form Card */}
              <div 
                className="p-4 sm:p-5 rounded-3xl shadow-xs mb-4"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderWidth: '1.5px',
                  borderStyle: 'solid'
                }}
              >
                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  {/* Avatar Section */}
                  <div 
                    className="p-3.5 rounded-2xl flex flex-col items-center justify-center mb-1"
                    style={{
                      backgroundColor: secondaryBg,
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid'
                    }}
                  >
                    <div className="relative group">
                      <div 
                        className="w-20 h-20 rounded-full font-bold flex items-center justify-center overflow-hidden shadow-md"
                        style={{
                          backgroundColor: `${primaryColor}15`,
                          borderColor: cardBorder,
                          borderWidth: '2px',
                          borderStyle: 'solid',
                          color: primaryColor
                        }}
                      >
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="صورة الملف" className="w-full h-full object-cover" />
                        ) : (
                          <User size={36} />
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handlePickImage(false)}
                        className="absolute bottom-0 left-0 p-1.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryTextColor
                        }}
                        title="رفع صورة جديدة من الهاتف"
                      >
                        <CameraIcon size={14} />
                      </button>

                      <input
                        id="profile-avatar-upload"
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, false)}
                        style={{ display: 'none' }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePickImage(false)}
                      className="mt-1.5 text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      style={{ color: primaryColor }}
                    >
                      <CameraIcon size={12} />
                      <span>استيراد صورة من الهاتف</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                        className="mt-1 text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>استعادة الصورة الافتراضية</span>
                      </button>
                    )}

                    {/* Preset Avatars */}
                    <div className="mt-2.5 flex items-center justify-center gap-1.5">
                      {PRESET_AVATARS.map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrl(url)}
                          className="w-7 h-7 rounded-full overflow-hidden transition-all cursor-pointer"
                          style={{
                            borderColor: avatarUrl === url ? primaryColor : cardBorder,
                            borderWidth: avatarUrl === url ? '2px' : '1px',
                            borderStyle: 'solid',
                            opacity: avatarUrl === url ? 1 : 0.75
                          }}
                        >
                          <img src={url} alt={`رمز ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Username */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      اسم المستخدم / اللقب المبارك:
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setError('');
                      }}
                      placeholder=""
                      enterKeyHint="next"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (country === 'دولة أخرى / كتابة يدوية ✍️' && customCountryRef.current) {
                            customCountryRef.current.focus();
                          } else if (bioRef.current) {
                            bioRef.current.focus();
                          }
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  {/* Country */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      الدولة / البلد:
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (e.target.value !== 'دولة أخرى / كتابة يدوية ✍️') {
                          setCustomCountry('');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    >
                      <option value="">-- اختر الدولة أو البلد --</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    {country === 'دولة أخرى / كتابة يدوية ✍️' && (
                      <div className="mt-2">
                        <input
                          ref={customCountryRef}
                          type="text"
                          value={customCountry}
                          onChange={(e) => setCustomCountry(e.target.value)}
                          placeholder=""
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              bioRef.current?.focus();
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                          style={{
                            borderColor: cardBorder,
                            borderWidth: '1.5px',
                            borderStyle: 'solid',
                            backgroundColor: secondaryBg,
                            color: theme.textColor
                          }}
                          autoFocus
                        />
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      نبذة بسيطة (اختياري):
                    </label>
                    <input
                      ref={bioRef}
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder=""
                      enterKeyHint="next"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          passcodeRef.current?.focus();
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  {/* Optional Passcode / PIN */}
                  <div>
                    <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                      <span className="flex items-center gap-1">
                        <span>رمز مرور سري لحماية الحساب (اختياري):</span>
                      </span>
                      <span className="text-[10px] opacity-60 font-normal">4-6 أرقام</span>
                    </label>
                    <input
                      ref={passcodeRef}
                      type="password"
                      maxLength={8}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder=""
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveProfile(e);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-3 rounded-xl font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                      style={{
                        backgroundColor: primaryColor,
                        color: primaryTextColor
                      }}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>جارٍ الحفظ والمزامنة...</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>حفظ التعديلات والدخول للدردشة</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      style={{
                        backgroundColor: secondaryBg,
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        color: theme.textColor
                      }}
                    >
                      <Trash2 size={13} className="text-rose-500" />
                      <span>تسجيل الخروج وإنشاء حساب جديد</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 2: Create Brand New Account */}
          {(activeTab === 'create_new' || (!currentUser.username && activeTab === 'profile')) && (
            <div 
              className="p-4 sm:p-5 rounded-3xl shadow-xs mb-4"
              style={{
                backgroundColor: cardBg,
                borderColor: cardBorder,
                borderWidth: '1.5px',
                borderStyle: 'solid'
              }}
            >
              <form onSubmit={handleCreateNewAccount} className="space-y-3.5">
                {/* Avatar Section */}
                <div 
                  className="p-3.5 rounded-2xl flex flex-col items-center justify-center mb-1"
                  style={{
                    backgroundColor: secondaryBg,
                    borderColor: cardBorder,
                    borderWidth: '1.5px',
                    borderStyle: 'solid'
                  }}
                >
                  <div className="relative group">
                    <div 
                      className="w-20 h-20 rounded-full font-bold flex items-center justify-center overflow-hidden shadow-md"
                      style={{
                        backgroundColor: `${primaryColor}15`,
                        borderColor: cardBorder,
                        borderWidth: '2px',
                        borderStyle: 'solid',
                        color: primaryColor
                      }}
                    >
                      {newAvatarUrl ? (
                        <img src={newAvatarUrl} alt="صورة الملف" className="w-full h-full object-cover" />
                      ) : (
                        <User size={36} />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handlePickImage(true)}
                      className="absolute bottom-0 left-0 p-1.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer z-10"
                      style={{
                        backgroundColor: primaryColor,
                        color: primaryTextColor
                      }}
                      title="اختيار صورة من الهاتف"
                    >
                      <CameraIcon size={14} />
                    </button>

                    <input
                      id="new-avatar-upload"
                      ref={newFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, true)}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePickImage(true)}
                    className="mt-1.5 text-[11px] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    style={{ color: primaryColor }}
                  >
                    <CameraIcon size={12} />
                    <span>استيراد صورة من الهاتف</span>
                  </button>

                  {/* Preset Avatars */}
                  <div className="mt-2.5 flex items-center justify-center gap-1.5">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setNewAvatarUrl(url)}
                        className="w-7 h-7 rounded-full overflow-hidden transition-all cursor-pointer"
                        style={{
                          borderColor: newAvatarUrl === url ? primaryColor : cardBorder,
                          borderWidth: newAvatarUrl === url ? '2px' : '1px',
                          borderStyle: 'solid',
                          opacity: newAvatarUrl === url ? 1 : 0.75
                        }}
                      >
                        <img src={url} alt={`رمز ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                    اسم المستخدم / اللقب الجديد:
                  </label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value);
                      setError('');
                    }}
                    placeholder=""
                    enterKeyHint="next"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newCountry === 'دولة أخرى / كتابة يدوية ✍️' && newCustomCountryRef.current) {
                          newCustomCountryRef.current.focus();
                        } else if (newBioRef.current) {
                          newBioRef.current.focus();
                        }
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                    الدولة / البلد:
                  </label>
                  <select
                    value={newCountry}
                    onChange={(e) => {
                      setNewCountry(e.target.value);
                      if (e.target.value !== 'دولة أخرى / كتابة يدوية ✍️') {
                        setNewCustomCountry('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  >
                    <option value="">-- اختر الدولة أو البلد --</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {newCountry === 'دولة أخرى / كتابة يدوية ✍️' && (
                    <div className="mt-2">
                      <input
                        ref={newCustomCountryRef}
                        type="text"
                        value={newCustomCountry}
                        onChange={(e) => setNewCustomCountry(e.target.value)}
                        placeholder=""
                        enterKeyHint="next"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            newBioRef.current?.focus();
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                        style={{
                          borderColor: cardBorder,
                          borderWidth: '1.5px',
                          borderStyle: 'solid',
                          backgroundColor: secondaryBg,
                          color: theme.textColor
                        }}
                        autoFocus
                      />
                    </div>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                    نبذة بسيطة (اختياري):
                  </label>
                  <input
                    ref={newBioRef}
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder=""
                    enterKeyHint="next"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        newPasscodeRef.current?.focus();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                </div>

                {/* Optional Passcode / PIN */}
                <div>
                  <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                    <span className="flex items-center gap-1">
                      <span>رمز مرور سري لحماية هذا الحساب (اختياري):</span>
                    </span>
                    <span className="text-[10px] opacity-60 font-normal">4-6 أرقام</span>
                  </label>
                  <input
                    ref={newPasscodeRef}
                    type="password"
                    maxLength={8}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder=""
                    enterKeyHint="done"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateNewAccount(e);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isCreatingNew}
                    className="w-full py-3 rounded-xl font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                    style={{
                      backgroundColor: primaryColor,
                      color: primaryTextColor
                    }}
                  >
                    {isCreatingNew ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>جارٍ إنشاء الحساب الجديد...</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>إنشاء الحساب وبدء التراسل</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: Restore Existing Account */}
          {activeTab === 'restore' && (
            <div className="space-y-4">
              {/* Info Card */}
              <div 
                className="p-3.5 rounded-2xl text-xs leading-relaxed"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderWidth: '1.5px',
                  borderStyle: 'solid',
                  color: theme.textColor
                }}
              >
                <p className="font-bold mb-1 flex items-center gap-1.5" style={{ color: theme.textColor }}>
                  <span>فتح حسابك من أي جهاز:</span>
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: theme.textColor, opacity: 0.75 }}>
                  أدخل اسمك بالكامل أو كود الحساب (مثل: <span className="font-mono font-bold" style={{ color: primaryColor }}>MQ-XXXXX</span>)، وسيتم استعادة حسابك ومحادثاتك فوراً!
                </p>
              </div>

              {/* Restore Form Card */}
              <div 
                className="p-4 sm:p-5 rounded-3xl shadow-xs"
                style={{
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                  borderWidth: '1.5px',
                  borderStyle: 'solid'
                }}
              >
                <form onSubmit={handleRestoreAccount} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      اسم المستخدم بالكامل أو كود الحساب الفريد:
                    </label>
                    <input
                      type="text"
                      value={restoreCode}
                      onChange={(e) => {
                        setRestoreCode(e.target.value);
                        setError('');
                      }}
                      placeholder="اكتب اسمك بالكامل (مثل: علاء أحمد) أو كود الحساب"
                      enterKeyHint="next"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          restorePasscodeRef.current?.focus();
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                      <span>رمز الحماية (PIN) - إن كنت قد قمت بتعيينه:</span>
                      <span className="text-[10px] opacity-60 font-normal">4-6 أرقام</span>
                    </label>
                    <input
                      ref={restorePasscodeRef}
                      type="password"
                      maxLength={8}
                      value={restorePasscode}
                      onChange={(e) => {
                        setRestorePasscode(e.target.value);
                        setError('');
                      }}
                      placeholder=""
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleRestoreAccount(e);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isRestoring}
                      className="w-full py-3 rounded-xl font-bold shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
                      style={{
                        backgroundColor: primaryColor,
                        color: primaryTextColor
                      }}
                    >
                      {isRestoring ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>جارٍ البحث واستعادة الحساب...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={16} />
                          <span>استعادة الحساب والدخول</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
      </div>

      {/* Interactive Avatar Image Cropper Modal */}
      <AvatarCropperModal
        isOpen={cropperOpen}
        imageSrc={cropperImgSrc}
        onCropComplete={handleCropComplete}
        onCancel={() => {
          setCropperOpen(false);
          setCropperImgSrc('');
        }}
      />

      {/* Standard App Bottom Bar */}
      <BottomBar onHomeClick={handleBackAction} onThemesClick={() => {}} showThemes={false} />
    </div>
  );
};

export default UsernameModal;
