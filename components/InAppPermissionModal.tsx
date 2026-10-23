import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  MapPin, 
  Bell, 
  Camera, 
  X, 
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
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const [isLoading, setIsLoading] = useState(false);
  const [hasFailedOnce, setHasFailedOnce] = useState(false);

  const isBlackTheme = theme.bgColor === '#000000';
  const cardBg = isBlackTheme ? '#181818' : (theme.cardBg || (theme.isDark ? '#1e293b' : '#ffffff'));
  const cardBorder = isBlackTheme ? '#333333' : (theme.cardBorder || (theme.isDark ? '#334155' : '#e2e8f0'));
  const textColor = theme.textColor || (theme.isDark ? '#ffffff' : '#000000');
  const textMuted = isBlackTheme ? '#9ca3af' : (theme.isDark ? '#94a3b8' : '#64748b');

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
          badge: isEn ? 'Notifications Permission' : 'صلاحية الإشعارات والتنبيهات',
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
          dir={isEn ? 'ltr' : 'rtl'}
          style={{ fontFamily: theme.font }}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border shadow-2xl p-6 space-y-5 overflow-hidden relative"
            style={{
              backgroundColor: cardBg,
              borderColor: cardBorder,
              color: textColor
            }}
          >
            {/* Top decorative accent bar */}
            <div 
              className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-500 opacity-90" 
            />

            {/* Header row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-inner ${config.iconBg}`}>
                  <IconComponent size={26} className="animate-pulse" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 mb-1">
                    <ShieldCheck size={12} />
                    {config.badge}
                  </span>
                  <h3 className="text-base font-bold leading-tight" style={{ color: textColor }}>
                    {config.title}
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center border transition-all active:scale-95 cursor-pointer hover:bg-neutral-500/10"
                style={{ borderColor: cardBorder, color: textMuted }}
                title={isEn ? 'Close' : 'إغلاق'}
              >
                <X size={16} />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm leading-relaxed" style={{ color: textMuted }}>
              {config.description}
            </p>

            {/* Features list */}
            <div 
              className="rounded-2xl p-3.5 space-y-2 border text-xs"
              style={{ 
                backgroundColor: isBlackTheme ? '#121212' : (theme.isDark ? '#0f172a80' : '#f8fafc'),
                borderColor: cardBorder 
              }}
            >
              {config.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2.5">
                  <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  <span style={{ color: textColor }}>{feature}</span>
                </div>
              ))}
            </div>

            {/* Fallback warning if rejected previously */}
            {hasFailedOnce && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="rounded-2xl p-3 bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">
                    {isEn 
                      ? 'Permission was declined or blocked by system.' 
                      : 'تم رفض الإذن أو إيقافه من إعدادات الهاتف.'}
                  </p>
                  <p className="text-[11px] opacity-90">
                    {isEn 
                      ? 'You can grant it directly from App Settings with one tap below.' 
                      : 'يمكنك فتح صفحة أذونات التطبيق مباشرة بالضغط على الزر أدناه ومنح الصلاحية.'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleGrantPermission}
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-105"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>{isEn ? 'Grant Permission Now' : 'السماح بالصلاحية الآن'}</span>
                  </>
                )}
              </button>

              {hasFailedOnce && (
                <button
                  type="button"
                  onClick={handleOpenSettings}
                  className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 border transition-all active:scale-[0.98] cursor-pointer hover:bg-neutral-500/10"
                  style={{ borderColor: cardBorder, color: textColor }}
                >
                  <SettingsIcon size={14} />
                  <span>{isEn ? 'Open App Settings' : 'فتح إعدادات التطبيق بالهاتف'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-center text-xs font-medium cursor-pointer transition-colors hover:underline"
                style={{ color: textMuted }}
              >
                {isEn ? 'Cancel / Later' : 'إلغاء / لاحقاً'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
export default InAppPermissionModal;
