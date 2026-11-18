import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  const { theme, isNightMode, homeThemeVariant } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';
  const isBlackTheme = theme.bgColor === '#000000' || isNightMode;
  const isSky = !isBlackTheme && homeThemeVariant === 'sky';
  const isEmerald = !isBlackTheme && homeThemeVariant === 'emerald';
  const isBurgundy = !isBlackTheme && homeThemeVariant === 'burgundy';

  const card3dStyle: React.CSSProperties = isBlackTheme
    ? {
        background: 'linear-gradient(168deg, #24242f 0%, #191922 65%, #121218 100%)',
        border: '1px solid rgba(255, 255, 255, 0.14)',
        boxShadow: '0 5px 0 #07070b, 0 12px 24px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.16)',
        color: '#ffffff',
      }
    : {
        background: isSky
          ? 'linear-gradient(180deg, #ffffff 0%, #f0f9ff 100%)'
          : isEmerald
            ? 'linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)'
            : isBurgundy
              ? 'linear-gradient(180deg, #ffffff 0%, #fff1f2 100%)'
              : 'linear-gradient(180deg, #ffffff 0%, #fffdf2 100%)',
        border: isSky
          ? '1px solid rgba(14, 165, 233, 0.25)'
          : isEmerald
            ? '1px solid rgba(16, 185, 129, 0.25)'
            : isBurgundy
              ? '1px solid rgba(225, 29, 72, 0.25)'
              : '1px solid rgba(217, 119, 6, 0.25)',
        boxShadow: isSky
          ? '0 5px 0 rgba(2, 132, 199, 0.18), 0 12px 24px rgba(2, 132, 199, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)'
          : isEmerald
            ? '0 5px 0 rgba(5, 150, 105, 0.18), 0 12px 24px rgba(5, 150, 105, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)'
            : isBurgundy
              ? '0 5px 0 rgba(190, 18, 60, 0.18), 0 12px 24px rgba(190, 18, 60, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)'
              : '0 5px 0 rgba(180, 115, 20, 0.2), 0 12px 24px rgba(180, 115, 20, 0.12), inset 0 2px 1.5px rgba(255, 255, 255, 0.98)',
        color: '#0f172a',
      };

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
      <div
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
                  className="unified-3d-btn w-10 h-10 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 shadow-[0_2.5px_0_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.28)] cursor-pointer"
                  title={isEn ? "Go Back" : "رجوع للخلف"}
                  aria-label={isEn ? "Go Back" : "رجوع للخلف"}
                >
                  <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                </button>
              </div>

              <div className="text-center px-12 min-w-0">
                <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                  {config.badge}
                </h1>
              </div>

              <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                <button
                  onClick={onClose}
                  className="unified-3d-btn w-10 h-10 rounded-full flex items-center justify-center bg-black/10 dark:bg-white/10 shadow-[0_2.5px_0_rgba(0,0,0,0.16),inset_0_1px_1px_rgba(255,255,255,0.28)] cursor-pointer"
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
          <div className="flex items-center gap-3.5 p-4 sm:p-5 rounded-3xl" style={card3dStyle}>
            <div
              className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 ${config.iconBg}`}
              style={{
                boxShadow: isBlackTheme
                  ? '0 3.5px 0 #07070b, inset 0 1.5px 1px rgba(255,255,255,0.2)'
                  : '0 3.5px 0 rgba(15,23,42,0.12), inset 0 1.5px 1px rgba(255,255,255,0.9)',
                border: isBlackTheme ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(15,23,42,0.08)'
              }}
            >
              <IconComponent size={24} className="animate-pulse" />
            </div>
            <div>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 mb-1.5"
                style={{ boxShadow: '0 2px 0 rgba(16,185,129,0.16), inset 0 1px 0 rgba(255,255,255,0.5)' }}
              >
                <ShieldCheck size={12} />
                {config.badge}
              </span>
              <h3 className="text-base sm:text-lg font-bold leading-tight">
                {config.title}
              </h3>
            </div>
          </div>

          <p className={`text-xs sm:text-sm leading-relaxed px-1 font-medium ${isBlackTheme ? 'text-zinc-300' : 'text-slate-600'}`}>
            {config.description}
          </p>

          <div className="rounded-3xl p-4 sm:p-5 space-y-3 text-xs sm:text-sm font-semibold" style={card3dStyle}>
            {config.features.map((feature, idx) => (
              <div key={idx} className="flex items-center gap-2.5">
                <CheckCircle2 size={17} className="text-emerald-500 shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {hasFailedOnce && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="rounded-3xl p-4 flex items-start gap-3 text-xs sm:text-sm"
              style={{
                background: isBlackTheme
                  ? 'linear-gradient(168deg, rgba(245,158,11,0.18) 0%, rgba(180,83,9,0.12) 100%)'
                  : 'linear-gradient(180deg, #fffbeb 0%, #fef3c7 100%)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: isBlackTheme ? '#fcd34d' : '#92400e',
                boxShadow: isBlackTheme
                  ? '0 4px 0 #07070b, inset 0 1px 1px rgba(255,255,255,0.14)'
                  : '0 4px 0 rgba(217,119,6,0.22), inset 0 1.5px 1px rgba(255,255,255,0.9)'
              }}
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
              className="unified-3d-btn w-full py-4 px-5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #10b981 0%, #059669 60%, #047857 100%)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                boxShadow: isBlackTheme
                  ? '0 5px 0 #022c22, 0 12px 24px rgba(5, 150, 105, 0.35), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.38)'
                  : '0 5px 0 #065f46, 0 12px 24px rgba(5, 150, 105, 0.3), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.45)'
              }}
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
                className="unified-3d-btn w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                style={card3dStyle}
              >
                <SettingsIcon size={16} />
                <span>{isEn ? 'Open App Settings' : 'فتح إعدادات التطبيق بالهاتف'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
  );
};

export default InAppPermissionModal;
