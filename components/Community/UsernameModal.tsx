import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Check, Sparkles, ArrowRight, Camera as CameraIcon, Trash2, 
  Loader2, KeyRound, Copy, LogIn, Lock, CheckCircle2, Shield,
  AlertCircle, HelpCircle, Globe
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { communityService, CommunityUser } from '../../services/communityService';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { AvatarCropperModal } from './AvatarCropperModal';
import ThemePageLock from '../ThemePageLock';
import { useShowNewBadge, markPageAsSeen } from '../../utils/badgeManager';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { formatCountryName } from './communityLanguageUtils';
import { 
  CommunitySpotlightGuide, 
  getGuideSeen 
} from './CommunitySpotlightGuide';
import { 
  ONBOARDING_REGISTER_STEPS, 
  ONBOARDING_RESTORE_STEPS 
} from './communityTourSteps';

interface UsernameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  isInitialPrompt?: boolean;
  onBackToApps?: () => void;
  onNavigate?: (pageId: string, params?: any) => void;
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

export interface AvatarOption {
  url: string;
  category: 'realistic' | 'cartoon' | 'avatar3d' | 'islamic';
  label: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  // 1. صور واقعية (نساء بالحجاب ورجال محترمون)
  { url: '/assets/avatars/hijab_woman_emerald_1792672024617.jpg', category: 'realistic', label: 'أخت بحجاب زمردي' },
  { url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', category: 'realistic', label: 'شاب مبتسم' },
  { url: '/assets/avatars/hijab_woman_pastel_1792672025965.jpg', category: 'realistic', label: 'أخت بحجاب وردي' },
  { url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'realistic', label: 'رجل بنظارة' },
  { url: '/assets/avatars/hijab_woman_beige_1792672025440.jpg', category: 'realistic', label: 'أخت بحجاب بيج' },
  { url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', category: 'realistic', label: 'شاب ببدلة' },
  { url: '/assets/avatars/hijab_woman_navy_1792672044491.jpg', category: 'realistic', label: 'أخت بحجاب كحلي' },
  { url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', category: 'realistic', label: 'شاب وقور' },
  { url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', category: 'realistic', label: 'ابتسامة مشرقة' },
  { url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150', category: 'realistic', label: 'شاب معاصر' },

  // 2. صور كرتونية ورسوم متحركة (كرتون بحجاب ورسوم محتشمة)
  { url: '/assets/avatars/hijab_avatar_cartoon_1792672065395.jpg', category: 'cartoon', label: 'كرتون: أخت بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad&backgroundColor=b6e3f4', category: 'cartoon', label: 'كرتون: أحمد' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Fatima&backgroundColor=ffd5dc', category: 'cartoon', label: 'كرتون: فاطمة بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Omar&backgroundColor=c0aede', category: 'cartoon', label: 'كرتون: عمر' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Mariam&backgroundColor=c0aede', category: 'cartoon', label: 'كرتون: مريم بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Youssef&backgroundColor=d1d4f9', category: 'cartoon', label: 'كرتون: يوسف' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Aisha&backgroundColor=ffdfbf', category: 'cartoon', label: 'كرتون: عائشة بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali&backgroundColor=b6e3f4', category: 'cartoon', label: 'كرتون: علي' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Zahra&backgroundColor=ffdfbf', category: 'cartoon', label: 'كرتون: زهراء بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Zaid&backgroundColor=b6e3f4', category: 'cartoon', label: 'رسوم: زيد' },
  { url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Bilal&backgroundColor=d1d4f9', category: 'cartoon', label: 'أنمي: بلال' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Khadija&backgroundColor=b6e3f4', category: 'cartoon', label: 'كرتون: خديجة بالحجاب' },

  // 3. أفاتار ثلاثي الأبعاد وعصري (3D & Digital Avatars مع الحجاب)
  { url: '/assets/avatars/hijab_avatar_modern_3d_1792672065148.jpg', category: 'avatar3d', label: 'أفاتار 3D: أخت بالحجاب' },
  { url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', category: 'avatar3d', label: 'أفاتار 3D' },
  { url: 'https://api.dicebear.com/7.x/bottts/svg?seed=QuranKid&backgroundColor=c0aede', category: 'avatar3d', label: 'روبوت لطيف' },
  { url: 'https://api.dicebear.com/7.x/bottts/svg?seed=RoboMuslim&backgroundColor=b6e3f4', category: 'avatar3d', label: 'أفاتار مستقبلي' },
  { url: 'https://api.dicebear.com/7.x/notionists/svg?seed=Tariq&backgroundColor=c0aede', category: 'avatar3d', label: 'أفاتار فني: طارق' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Huda&backgroundColor=ffd5dc', category: 'avatar3d', label: 'أفاتار: هدى بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/micah/svg?seed=Ibrahim&backgroundColor=b6e3f4', category: 'avatar3d', label: 'أفاتار عصري: إبراهيم' },
  { url: 'https://api.dicebear.com/7.x/avataaars/svg?top=hijab&seed=Ruqayyah&backgroundColor=ffdfbf', category: 'avatar3d', label: 'أفاتار: رقية بالحجاب' },
  { url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Happy&backgroundColor=ffd5dc', category: 'avatar3d', label: 'إيموجي مرح' },
  { url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=Barakah&backgroundColor=c0aede', category: 'avatar3d', label: 'أفاتار بركة' },

  // 4. معالم وقيم إسلامية وطبيعة (Islamic & Landmarks)
  { url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=150', category: 'islamic', label: 'المصحف الشريف' },
  { url: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=150', category: 'islamic', label: 'الكعبة المشرفة' },
  { url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=150', category: 'islamic', label: 'المسجد النبوي' },
  { url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=150', category: 'islamic', label: 'قبة المسجد' },
  { url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=150', category: 'islamic', label: 'فانوس إسلامي' },
  { url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=150', category: 'islamic', label: 'طبيعة وسلام' }
];

const PRESET_AVATARS = AVATAR_OPTIONS.map(a => a.url);

const AVATAR_CATEGORIES = [
  { id: 'all', label: 'الكل', labelEn: 'All' },
  { id: 'cartoon', label: 'كرتونية 🎨', labelEn: 'Cartoon 🎨' },
  { id: 'avatar3d', label: 'أفاتار 3D 🤖', labelEn: '3D Avatar 🤖' },
  { id: 'realistic', label: 'واقعية 👤', labelEn: 'Realistic 👤' },
  { id: 'islamic', label: 'إسلامية 🕌', labelEn: 'Islamic 🕌' }
] as const;

interface AvatarSelectorProps {
  selectedUrl: string;
  onSelect: (url: string) => void;
  primaryColor: string;
  cardBorder: string;
  isDeepBlack: boolean;
  textColor?: string;
  isEn?: boolean;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedUrl,
  onSelect,
  primaryColor,
  cardBorder,
  isDeepBlack,
  textColor,
  isEn = false
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const filteredAvatars = activeCategory === 'all'
    ? AVATAR_OPTIONS
    : AVATAR_OPTIONS.filter(a => a.category === activeCategory);

  return (
    <div className="w-full mt-2.5">
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[11px] font-bold" style={{ color: textColor || 'inherit' }}>
          {isEn ? `Choose an avatar (${filteredAvatars.length}):` : `اختر صورة رمزية (${filteredAvatars.length}):`}
        </span>
      </div>

      {/* شريط التصنيفات */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1.5 no-scrollbar">
        {AVATAR_CATEGORIES.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all shrink-0 cursor-pointer"
              style={{
                backgroundColor: isActive ? primaryColor : (isDeepBlack ? '#1e1e1e' : 'rgba(0,0,0,0.05)'),
                color: isActive ? (isDeepBlack ? '#000000' : '#ffffff') : (textColor || 'inherit'),
                border: isActive ? `1px solid ${primaryColor}` : `1px solid ${cardBorder}40`
              }}
            >
              {isEn ? cat.labelEn : cat.label}
            </button>
          );
        })}
      </div>

      {/* شريط الصور بحجم صغير كما كانت سابقاً */}
      <div 
        className="flex items-center gap-2 overflow-x-auto p-2 rounded-xl border no-scrollbar"
        style={{
          borderColor: `${cardBorder}50`,
          backgroundColor: isDeepBlack ? '#141414' : 'rgba(0,0,0,0.02)'
        }}
      >
        {filteredAvatars.map((item, idx) => {
          const isSelected = selectedUrl === item.url;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelect(item.url)}
              title={item.label}
              className="relative w-9 h-9 shrink-0 rounded-full overflow-hidden transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer flex items-center justify-center group"
              style={{
                borderWidth: isSelected ? '2.5px' : '1.5px',
                borderColor: isSelected ? primaryColor : cardBorder,
                boxShadow: isSelected ? `0 0 8px ${primaryColor}70` : 'none',
                opacity: isSelected ? 1 : 0.85
              }}
            >
              <img 
                src={item.url} 
                alt={item.label} 
                className="w-full h-full object-cover" 
                loading="lazy" 
                referrerPolicy="no-referrer"
              />
              {isSelected && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[0.5px]"
                >
                  <Check size={12} className="text-white stroke-[3] drop-shadow-md" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const compressAvatar = (dataUrl: string, maxDim = 512, quality = 0.90): Promise<string> => {
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
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const compressed = canvas.toDataURL('image/jpeg', quality);
          resolve(compressed);
        } catch (e) {
          resolve(dataUrl || PRESET_AVATARS[0]);
        }
      } else {
        resolve(dataUrl || PRESET_AVATARS[0]);
      }
    };
    img.onerror = () => resolve(dataUrl || PRESET_AVATARS[0]);
    img.src = dataUrl;
  });
};

const UsernameModal: React.FC<UsernameModalProps> = ({ 
  isOpen, 
  onClose, 
  onSaved, 
  onBackToApps,
  onNavigate
}) => {
  const { theme, themeKey } = useTheme();
  const { language, setLanguage } = useLanguage();
  const isEn = language === 'en';
  const showNewBadge = useShowNewBadge('ahl-al-quran');
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

  // Spotlight tour states - independent per tab
  const [showRegTour, setShowRegTour] = useState(false);
  const [showRestoreTour, setShowRestoreTour] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowRegTour(false);
      setShowRestoreTour(false);
      return;
    }

    if (activeTab === 'create_new' || (!currentUser.username && activeTab === 'profile')) {
      setShowRestoreTour(false);
      if (!getGuideSeen('onboarding_register')) {
        const timer = setTimeout(() => setShowRegTour(true), 350);
        return () => clearTimeout(timer);
      }
    } else if (activeTab === 'restore') {
      setShowRegTour(false);
      if (!getGuideSeen('onboarding_restore')) {
        const timer = setTimeout(() => setShowRestoreTour(true), 350);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, activeTab, currentUser.username]);
  
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
      const compressed = await compressAvatar(croppedDataUrl, 512, 0.90);
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
      setError(isEn ? 'Please enter a username or nickname (at least 2 characters)' : 'يرجى إدخال اسم المستخدم أو اللقب المبارك (حرفين على الأقل)');
      return;
    }

    let finalCountry = country;
    if (country === 'دولة أخرى / كتابة يدوية ✍️') {
      finalCountry = customCountry.trim();
    }
    const finalAvatar = avatarUrl && avatarUrl.trim() ? avatarUrl.trim() : PRESET_AVATARS[0];

    if (passcode && passcode.trim()) {
      const cleanPass = communityService.normalizeDigits(passcode);
      if (cleanPass.length < 6 || cleanPass.length > 12) {
        setError(isEn ? 'Please enter a passcode of 6 to 12 characters (letters and numbers)' : 'يرجى إدخال رقم سري مكون من 6 إلى 12 حرف أو رقم');
        passcodeRef.current?.focus();
        return;
      }
    }

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
      setSuccessMsg(isEn ? 'Profile saved successfully! Entering chat...' : 'تم حفظ البيانات بنجاح! جاري الدخول للدردشة...');
      try {
        localStorage.removeItem('onboarding_cancelled_without_account');
      } catch (e) {}
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 100);
    } catch (err: any) {
      console.error('Save profile error:', err);
      setError(err?.message || (isEn ? 'Error saving profile, please try again' : 'حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateNewAccount = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    if (!newUsername.trim() || newUsername.trim().length < 2) {
      setError(isEn ? 'Please enter a new username (at least 2 characters)' : 'يرجى إدخال اسم المستخدم الجديد (حرفين على الأقل)');
      return;
    }

    const cleanPass = communityService.normalizeDigits(newPasscode);
    if (!cleanPass) {
      setError(isEn ? 'Please set a passcode first (required for account security)' : 'يرجى تسجيل الرقم السري أولاً (إجباري لحماية الحساب واستعادته)');
      newPasscodeRef.current?.focus();
      return;
    }
    if (cleanPass.length < 6 || cleanPass.length > 12) {
      setError(isEn ? 'Please enter a passcode of 6 to 12 characters (letters and numbers)' : 'يرجى إدخال رقم سري مكون من 6 إلى 12 حرف أو رقم');
      newPasscodeRef.current?.focus();
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
      const created = await communityService.createNewAccount(newUsername, finalCountry, newBio, finalAvatar, cleanPass);
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

      setSuccessMsg(isEn ? `Account created successfully, ${created.username}! Your code is (${created.accountCode})` : `تم إنشاء حسابك الجديد بنجاح يا ${created.username}! كودك هو (${created.accountCode})`);
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 100);
    } catch (err: any) {
      console.error('Create new account error:', err);
      setError(err?.message || (isEn ? 'Error creating account, please try again' : 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى'));
    } finally {
      setIsCreatingNew(false);
    }
  };

  const handleRestoreAccount = async (e?: React.FormEvent | React.KeyboardEvent) => {
    e?.preventDefault();
    const cleanCode = restoreCode.trim();
    if (!cleanCode) {
      setError(isEn ? 'Please enter your username or account code (e.g. MQ-XXXXX)' : 'يرجى إدخال اسم المستخدم بالكامل أو كود الحساب (مثل MQ-XXXXX)');
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
      
      setSuccessMsg(isEn ? `Welcome back, ${restored.username}! Your account was restored successfully.` : `مرحباً بك مجدداً يا ${restored.username}! تم استعادة حسابك بنجاح.`);
      try {
        localStorage.removeItem('onboarding_cancelled_without_account');
      } catch (e) {}
      setTimeout(() => {
        if (onSaved) {
          onSaved();
        } else {
          onClose();
        }
      }, 100);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Unable to restore account. Check name/code and passcode.' : 'تعذر استعادة الحساب. تأكد من صحة الاسم أو الكود ورمز المرور.'));
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
    setSuccessMsg(isEn ? 'Signed out successfully. You can now enter your new name.' : 'تم تسجيل الخروج بنجاح. يمكنك الآن كتابة اسمك الجديد وبدء التراسل فوراً.');
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
      dir={isEn ? 'ltr' : 'rtl'}
      style={{ 
        backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#020617' : '#f8fafc')),
        color: theme.textColor || (theme.isDark || isBlackTheme ? '#ffffff' : '#0f172a'),
        fontFamily: theme.font,
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)'
      }}
    >
      {/* الشريط العلوي المدمج */}
      <header className="app-top-bar !min-h-0 py-1.5 shadow-sm shrink-0">
        <div className="app-top-bar__inner !min-h-0 !py-1 !max-w-4xl">
          <div className="flex items-center justify-between w-full min-h-[44px] gap-2">
            {/* بداية الشريط: سهم الرجوع للخلف */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleBackAction}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? "Back" : "رجوع للخلف"}
                aria-label={isEn ? "Back" : "رجوع للخلف"}
              >
                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
            </div>

            {/* الوسط: نص مجتمع أحمد وليلى */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              <h1 
                className="text-base sm:text-lg font-extrabold truncate text-center select-none"
                style={{ 
                  color: theme.textColor || (theme.isDark || isBlackTheme ? '#ffffff' : '#0f172a'),
                  fontFamily: theme.font
                }}
              >
                {isEn ? 'Ahmed & Layla Community' : 'مجتمع أحمد وليلى'}
              </h1>
            </div>

            {/* نهاية الشريط: زر الدليل والإرشاد + قفل السمة + زر الصفحة الرئيسية */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'restore') {
                    setShowRestoreTour(true);
                  } else {
                    setShowRegTour(true);
                  }
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                style={{ color: 'var(--top-bar-text, inherit)' }}
                title={isEn ? "Account Guide" : "دليل وشرح الحساب"}
                aria-label={isEn ? "Account Guide" : "دليل وشرح الحساب"}
              >
                <HelpCircle size={19} />
              </button>

              <ThemePageLock />
              <button
                type="button"
                onClick={() => onNavigate ? onNavigate('home') : handleBackAction()}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? "Home" : "الصفحة الرئيسية"}
                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
              >
                <i className="fa-solid fa-house text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Full Screen Scrollable Page Body */}
      <div className="flex-1 w-full px-2 sm:px-3 py-3">



        {/* Mode Switch Tabs */}
        <div 
          id="onboarding-tabs-container"
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
                  <span>{isEn ? 'Edit Profile' : 'تعديل حسابي'}</span>
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
                  <span>{isEn ? 'New Account' : 'حساب جديد'}</span>
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
                <span>{isEn ? 'Create New Account' : 'إنشاء حساب جديد'}</span>
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
              <span>{isEn ? 'Restore Account' : 'استعادة حساب'}</span>
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
                      {isEn ? 'Your permanent account code (for login on any phone):' : 'كود حسابك الدائم (للدخول من أي هاتف آخر):'}
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
                    <span>{copiedCode ? (isEn ? 'Copied!' : 'تم النسخ!') : (isEn ? 'Copy Code' : 'نسخ الكود')}</span>
                  </button>
                </div>
                <p className="text-[10px] mt-1.5 leading-relaxed" style={{ color: theme.textColor, opacity: 0.7 }}>
                  {isEn 
                    ? 'Save this code. When opening the app on any device, enter this code to restore your profile and chats.' 
                    : 'احفظ هذا الكود. عند فتح التطبيق من أي جهاز آخر، ادخل الكود لاستعادة اسمك ومحادثاتك فوراً.'}
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
                    id="onboarding-reg-avatar"
                    className="p-3.5 rounded-2xl flex flex-col items-center justify-center mb-1 scroll-mt-20"
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
                        className={`absolute bottom-0 ${isEn ? 'right-0' : 'left-0'} p-1.5 rounded-full shadow-lg transition-transform active:scale-95 cursor-pointer z-10`}
                        style={{
                          backgroundColor: primaryColor,
                          color: primaryTextColor
                        }}
                        title={isEn ? "Upload photo from phone" : "رفع صورة جديدة من الهاتف"}
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
                      <span>{isEn ? 'Import photo from phone' : 'استيراد صورة من الهاتف'}</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl(PRESET_AVATARS[0])}
                        className="mt-1 text-[11px] text-rose-500 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>{isEn ? 'Restore default avatar' : 'استعادة الصورة الافتراضية'}</span>
                      </button>
                    )}

                    {/* Preset Avatars */}
                    <AvatarSelector
                      selectedUrl={avatarUrl}
                      onSelect={(url) => setAvatarUrl(url)}
                      primaryColor={primaryColor}
                      cardBorder={cardBorder}
                      isDeepBlack={isDeepBlack}
                      textColor={theme.textColor}
                      isEn={isEn}
                    />
                  </div>

                  {/* Username */}
                  <div id="onboarding-reg-username">
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      {isEn ? 'Username / Nickname:' : 'اسم المستخدم / اللقب المبارك:'}
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
                          passcodeRef.current?.focus();
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  {/* Passcode / PIN - Directly below Username */}
                  <div id="onboarding-reg-passcode">
                    <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                      <span className="flex items-center gap-1">
                        <span>{isEn ? 'Passcode / PIN:' : 'الرقم السري:'}</span>
                      </span>
                      <span className="text-[10px] opacity-75 font-normal">{isEn ? '6-12 chars' : '6-12 حرف أو رقم'}</span>
                    </label>
                    <input
                      ref={passcodeRef}
                      type="password"
                      maxLength={12}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
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
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono shadow-xs"
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
                  <div id="onboarding-reg-country">
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      {isEn ? 'Country / Region:' : 'الدولة / البلد:'}
                    </label>
                    <select
                      value={country}
                      onChange={(e) => {
                        setCountry(e.target.value);
                        if (e.target.value !== 'دولة أخرى / كتابة يدوية ✍️') {
                          setCustomCountry('');
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    >
                      <option value="">{isEn ? '-- Select Country or Region --' : '-- اختر الدولة أو البلد --'}</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {formatCountryName(c, isEn)}
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
                          placeholder={isEn ? "Enter your country" : "اكتب اسم دولتك"}
                          enterKeyHint="next"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              bioRef.current?.focus();
                            }
                          }}
                          className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
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
                      {isEn ? 'Bio (Optional):' : 'نبذة بسيطة (اختياري):'}
                    </label>
                    <input
                      ref={bioRef}
                      type="text"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder=""
                      enterKeyHint="done"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSaveProfile(e);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all shadow-xs"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div id="onboarding-reg-actions" className="pt-2 space-y-2">
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
                          <span>{isEn ? 'Saving & syncing...' : 'جارٍ الحفظ والمزامنة...'}</span>
                        </>
                      ) : (
                        <>
                          <Check size={16} />
                          <span>{isEn ? 'Save Changes & Enter Chat' : 'حفظ التعديلات والدخول للدردشة'}</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleSwitchAccount}
                      className="w-full py-2 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      style={{
                        backgroundColor: secondaryBg,
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        color: theme.textColor
                      }}
                    >
                      <Trash2 size={13} className="text-rose-500" />
                      <span>{isEn ? 'Sign out and create new account' : 'تسجيل الخروج وإنشاء حساب جديد'}</span>
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
                  id="onboarding-reg-avatar"
                  className="p-3.5 rounded-2xl flex flex-col items-center justify-center mb-1 scroll-mt-20"
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
                    <span>{isEn ? 'Import photo from phone' : 'استيراد صورة من الهاتف'}</span>
                  </button>

                  {/* Preset Avatars */}
                  <AvatarSelector
                    selectedUrl={newAvatarUrl}
                    onSelect={(url) => setNewAvatarUrl(url)}
                    primaryColor={primaryColor}
                    cardBorder={cardBorder}
                    isDeepBlack={isDeepBlack}
                    textColor={theme.textColor}
                    isEn={isEn}
                  />
                </div>

                {/* Username */}
                <div id="onboarding-reg-username">
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                    {isEn ? 'New Username / Nickname:' : 'اسم المستخدم / اللقب الجديد:'}
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
                        newPasscodeRef.current?.focus();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                </div>

                {/* Passcode / PIN - Directly below Username */}
                <div id="onboarding-reg-passcode">
                  <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                    <span className="flex items-center gap-1">
                      <span>{isEn ? 'Passcode / PIN:' : 'الرقم السري:'}</span>
                    </span>
                    <span className="text-[10px] opacity-75 font-normal">{isEn ? '6-12 chars (Required)' : '6-12 حرف أو رقم (إجباري)'}</span>
                  </label>
                  <input
                    ref={newPasscodeRef}
                    type="password"
                    maxLength={12}
                    value={newPasscode}
                    onChange={(e) => {
                      setNewPasscode(e.target.value);
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
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono shadow-xs"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                  <p className="text-[10px] mt-1 opacity-70 leading-relaxed" style={{ color: theme.textColor }}>
                    {isEn 
                      ? 'Required for account security and recovery on any device.' 
                      : 'إجباري لحماية حسابك واستعادته عند الدخول من أي هاتف آخر.'}
                  </p>
                </div>

                {/* Country */}
                <div id="onboarding-reg-country">
                  <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                    {isEn ? 'Country / Region:' : 'الدولة / البلد:'}
                  </label>
                  <select
                    value={newCountry}
                    onChange={(e) => {
                      setNewCountry(e.target.value);
                      if (e.target.value !== 'دولة أخرى / كتابة يدوية ✍️') {
                        setNewCustomCountry('');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  >
                    <option value="">{isEn ? '-- Select Country or Region --' : '-- اختر الدولة أو البلد --'}</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {formatCountryName(c, isEn)}
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
                        placeholder={isEn ? "Enter your country" : "اكتب اسم دولتك"}
                        enterKeyHint="next"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            newBioRef.current?.focus();
                          }
                        }}
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
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
                    {isEn ? 'Bio (Optional):' : 'نبذة بسيطة (اختياري):'}
                  </label>
                  <input
                    ref={newBioRef}
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder=""
                    enterKeyHint="done"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleCreateNewAccount(e);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all shadow-xs"
                    style={{
                      borderColor: cardBorder,
                      borderWidth: '1.5px',
                      borderStyle: 'solid',
                      backgroundColor: secondaryBg,
                      color: theme.textColor
                    }}
                  />
                </div>

                {/* 30-Day Inactivity Deletion Condition */}
                <div 
                  className="p-3 rounded-2xl flex items-center gap-2.5 text-xs leading-relaxed"
                  style={{
                    backgroundColor: isBlackTheme ? '#181818' : (theme.isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2'),
                    borderColor: isBlackTheme ? '#333333' : 'rgba(239, 68, 68, 0.35)',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    color: isBlackTheme ? '#f87171' : (theme.isDark ? '#fca5a5' : '#b91c1c')
                  }}
                >
                  <AlertCircle size={18} className="shrink-0 text-rose-500" />
                  <p className="text-[11px] font-bold leading-relaxed">
                    {isEn 
                      ? 'If you do not open the app for 30 days, your account will be automatically deleted from the app.' 
                      : 'إذا لم تقم بفتح التطبيق لمدة 30 يوم سيتم حذف حسابك تلقائياً من التطبيق'}
                  </p>
                </div>

                <div id="onboarding-reg-actions" className="pt-2">
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
                        <span>{isEn ? 'Creating new account...' : 'جارٍ إنشاء الحساب الجديد...'}</span>
                      </>
                    ) : (
                      <>
                        <Check size={16} />
                        <span>{isEn ? 'Create Account & Start Chatting' : 'إنشاء الحساب وبدء التراسل'}</span>
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
                  <span>{isEn ? 'Access your account on any device:' : 'فتح حسابك من أي جهاز:'}</span>
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: theme.textColor, opacity: 0.75 }}>
                  {isEn 
                    ? <>Enter your full username or account code (e.g. <span className="font-mono font-bold" style={{ color: primaryColor }}>MQ-XXXXX</span>) to restore your profile and chats!</>
                    : <>أدخل اسمك بالكامل أو كود الحساب (مثل: <span className="font-mono font-bold" style={{ color: primaryColor }}>MQ-XXXXX</span>)، وسيتم استعادة حسابك ومحادثاتك فوراً!</>}
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
                  <div id="onboarding-restore-username">
                    <label className="block text-xs font-bold mb-1" style={{ color: theme.textColor }}>
                      {isEn ? 'Full username or unique account code:' : 'اسم المستخدم بالكامل أو كود الحساب الفريد:'}
                    </label>
                    <input
                      type="text"
                      value={restoreCode}
                      onChange={(e) => {
                        setRestoreCode(e.target.value);
                        setError('');
                      }}
                      placeholder={isEn ? "Enter your full username or account code" : "اكتب اسمك بالكامل (مثل: علاء أحمد) أو كود الحساب"}
                      enterKeyHint="next"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          restorePasscodeRef.current?.focus();
                        }
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-medium focus:outline-none transition-all shadow-xs"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div id="onboarding-restore-passcode">
                    <label className="block text-xs font-bold mb-1 flex items-center justify-between" style={{ color: theme.textColor }}>
                      <span>{isEn ? 'Account Passcode / PIN:' : 'الرقم السري لحسابك:'}</span>
                      <span className="text-[10px] opacity-75 font-normal">{isEn ? '6-12 chars' : '6-12 حرف أو رقم'}</span>
                    </label>
                    <input
                      ref={restorePasscodeRef}
                      type="password"
                      maxLength={12}
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
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs font-medium focus:outline-none transition-all font-mono shadow-xs"
                      style={{
                        borderColor: cardBorder,
                        borderWidth: '1.5px',
                        borderStyle: 'solid',
                        backgroundColor: secondaryBg,
                        color: theme.textColor
                      }}
                    />
                  </div>

                  <div id="onboarding-restore-actions" className="pt-2">
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
                          <span>{isEn ? 'Searching & restoring account...' : 'جارٍ البحث واستعادة الحساب...'}</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={16} />
                          <span>{isEn ? 'Restore Account & Sign In' : 'استعادة الحساب والدخول'}</span>
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

      {/* Interactive Spotlight Guides */}
      <CommunitySpotlightGuide
        guideKey="onboarding_register"
        steps={ONBOARDING_REGISTER_STEPS}
        isOpen={showRegTour && (activeTab === 'create_new' || activeTab === 'profile')}
        onClose={() => {
          setShowRegTour(false);
          try {
            localStorage.removeItem('onboarding_cancelled_without_account');
          } catch (e) {}
        }}
        isEn={isEn}
      />

      <CommunitySpotlightGuide
        guideKey="onboarding_restore"
        steps={ONBOARDING_RESTORE_STEPS}
        isOpen={showRestoreTour && activeTab === 'restore'}
        onClose={() => {
          setShowRestoreTour(false);
          try {
            localStorage.removeItem('onboarding_cancelled_without_account');
          } catch (e) {}
        }}
        isEn={isEn}
      />
    </div>
  );
};

export default UsernameModal;
