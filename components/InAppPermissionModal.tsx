import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  MapPin, 
  Bell, 
  Camera, 
  CheckCircle2, 
  Settings as SettingsIcon, 
  AlertCircle,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  requestMicrophonePermission, 
  requestLocationPermission, 
  requestNotificationPermission, 
  requestCameraPermission, 
  openAppSettings 
} from '../utils/permissionHelper';

export type PermissionType = 'microphone' | 'location' | 'notification' | 'camera';

interface InAppPermissionModalProps {
  isOpen: boolean;
  type: PermissionType;
  onClose: () => void;
  onGranted?: () => void;
  customTitle?: string;
  customDescription?: string;
}

export const InAppPermissionModal: React.FC<InAppPermissionModalProps> = ({
  isOpen,
  type,
  onClose,
  onGranted,
  customTitle,
  customDescription
}) => {
  const { theme, isNightMode } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isBlackTheme = theme.bgColor === '#000000' || isNightMode;

  const [isLoading, setIsLoading] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  const getConfig = () => {
    switch (type) {
      case 'microphone':
        return {
          icon: Mic,
          iconBg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
          badge: isEn ? 'Microphone Permission' : 'صلاحية الميكروفون',
          title: customTitle || (isEn ? 'Microphone Permission Required' : 'إذن الميكروفون مطلوب للتسجيل الصوتي'),
          description: customDescription || (isEn 
            ? 'To record and send clear voice messages in chat, please grant microphone permission.' 
            : 'لتسجيل وإرسال الرسائل الصوتية والتلاوة في المحادثة، يحتاج التطبيق إلى إذن استخدام الميكروفون.'),
          features: isEn ? [
            'Record crisp voice notes with one tap',
            'Full privacy: mic only activates when you hold or tap record',
            'Instant in-app permission without opening settings'
          ] : [
            'تسجيل رسائل صوتية واضحة ومشاركتها فوراً',
            'خصوصية تامة: الميكروفون لا يعمل إلا عند ضغط زر التسجيل',
            'منح الإذن مباشرة من داخل التطبيق دون عناء'
          ],
          requestFn: requestMicrophonePermission
        };
      case 'location':
        return {
          icon: MapPin,
          iconBg: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
          badge: isEn ? 'Location Permission' : 'صلاحية الموقع الجغرافي',
          title: customTitle || (isEn ? 'Location Access Required' : 'إذن الموقع الجغرافي مطلوب'),
          description: customDescription || (isEn
            ? 'To calculate accurate prayer times and precise Qibla direction for your city.'
            : 'لحساب مواقيت الصلاة بدقة فائقة وتحديد اتجاه القبلة الصحيح لمدينتك.'),
          features: isEn ? [
            'Accurate daily prayer and Azan times',
            'Real-time Qibla compass alignment',
            'Works automatically wherever you travel'
          ] : [
            'مواقيت صلاة دقيقة حسب إحداثيات موقعك الحالي',
            'بوصلة اتجاه القبلة المباشرة',
            'تحديث تلقائي أينما سافرت'
          ],
          requestFn: requestLocationPermission
        };
      case 'notification':
        return {
          icon: Bell,
          iconBg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
          badge: isEn ? 'Phone Notifications' : 'إشعارات الهاتف',
          title: customTitle || (isEn ? 'Enable Prayer & Azan Alerts' : 'تفعيل إشعارات الأذان والصلوات'),
          description: customDescription || (isEn
            ? 'Never miss a prayer with on-time Azan alerts and daily Athkar reminders.'
            : 'لتنبيهك بمواقيت الأذان والإقامة وأذكار الصباح والمساء في وقتها المحدد.'),
          features: isEn ? [
            'Audible Azan notifications on lock screen',
            'Iqama countdown alerts',
            'Morning and evening Athkar reminders'
          ] : [
            'صوت الأذان المبارك في مواقيت الصلاة',
            'تنبيهات الإقامة وقرب انتهاء وقت الصلاة',
            'أذكار الصباح والمساء والورد القرآني'
          ],
          requestFn: requestNotificationPermission
        };
      case 'camera':
        return {
          icon: Camera,
          iconBg: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
          badge: isEn ? 'Camera Permission' : 'صلاحية الكاميرا والوسائط',
          title: customTitle || (isEn ? 'Camera Access Required' : 'إذن الكاميرا مطلوب'),
          description: customDescription || (isEn
            ? 'To capture photos, update your avatar, and use Augmented Reality Qibla.'
            : 'لالتقاط الصور ومشاركتها وتعيين صورتك الشخصية واستخدام القبلة بالواقع المعزز.'),
          features: isEn ? [
            'Capture and share photos in chat',
            'Augmented Reality (AR) camera Qibla',
            'Custom avatar photo upload'
          ] : [
            'التقاط وإرسال الصور في المحادثات',
            'تحديد القبلة بالواقع المعزز عبر الكاميرا',
            'تعيين وتحديث الصورة الشخصية'
          ],
          requestFn: requestCameraPermission
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;

  const handleGrantPermission = async () => {
    setIsLoading(true);
    try {
      const res = await config.requestFn();
      if (res.granted) {
        setIsLoading(false);
        onClose();
        if (onGranted) {
          onGranted();
        }
      } else {
        setIsLoading(false);
        setHasFailedOnce(true);
      }
    } catch (e) {
      console.warn('Error during grant permission:', e);
      setIsLoading(false);
      setHasFailedOnce(true);
    }
  };

  const handleOpenSettings = async () => {
    await openAppSettings();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden"
        style={{ 
          backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#FFFFFF')) 
        }}
        dir={isEn ? 'ltr' : 'rtl'}
      >
        {/* Standard Page Header - Identical to Adia */}
        <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
          <div className="app-top-bar__inner">
            <div className="relative flex items-center justify-center w-full min-h-[44px]">
              <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={isEn ? "Go Back" : "رجوع للخلف"}
                  aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                >
                  <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                </button>
              </div>

              <div className="text-center px-12 min-w-0">
                <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                  {config.badge}
                </h1>
              </div>

              <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                  title={isEn ? "Close" : "إغلاق"}
                  aria-label={isEn ? "Close" : "إغلاق"}
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 max-w-2xl mx-auto w-full space-y-5 modal-sheet-safe-bottom">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl quran-raised-card bg-white dark:bg-zinc-900">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${config.iconBg}`}>
              <IconComponent size={24} className="animate-pulse" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                <ShieldCheck size={12} />
                {config.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                {config.title}
              </h3>
            </div>
          </div>

          <p className="text-xs sm:text-sm leading-relaxed text-slate-600 dark:text-zinc-300 px-1">
            {config.description}
          </p>

          <div className="rounded-2xl p-4 space-y-3 quran-raised-card bg-white dark:bg-zinc-900 text-xs sm:text-sm">
            {config.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {hasFailedOnce && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs sm:text-sm text-amber-700 dark:text-amber-300"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">
                  {isEn 
                    ? 'Permission was declined or blocked by system.' 
                    : 'تم رفض الإذن أو إيقافه من إعدادات الهاتف.'}
                </p>
                <p className="text-xs opacity-90">
                  {isEn 
                    ? 'You can grant it directly from App Settings with one tap below.' 
                    : 'يمكنك فتح صفحة أذونات التطبيق مباشرة بالضغط على الزر أدناه ومنح الصلاحية.'}
                </p>
              </div>
            </motion.div>
          )}

          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={handleGrantPermission}
              disabled={isLoading}
              className="w-full py-4 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{isEn ? 'Grant Permission Now' : 'السماح بالصلاحية الآن'}</span>
                </>
              )}
            </button>

            {hasFailedOnce && (
              <button
                type="button"
                onClick={handleOpenSettings}
                className="w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer quran-raised-card bg-white dark:bg-zinc-900"
              >
                <SettingsIcon size={16} />
                <span>{isEn ? 'Open App Settings' : 'فتح إعدادات التطبيق بالهاتف'}</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InAppPermissionModal;
