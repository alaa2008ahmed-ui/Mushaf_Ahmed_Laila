import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  HeartHandshake,
  QrCode
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';
import ShareAppQrModal from './ShareAppQrModal';

interface ShareAppCardProps {
  shareTextAr: string;
  shareTextEn: string;
  setToastMessage: (msg: string) => void;
}

export const ShareAppCard: React.FC<ShareAppCardProps> = ({
  shareTextAr,
  shareTextEn,
  setToastMessage,
}) => {
  const { language, dir, t } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#fbbf24' : (theme.palette?.[0] || '#b45309');

  const textToShare = language === 'en' ? shareTextEn : shareTextAr;

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(textToShare);
      setCopied(true);
      setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة بنجاح'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
    }
  };

  const handleShareApp = async () => {
    const shareData = {
      title: language === 'en' ? 'Mushaf Ahmed & Laial' : 'مصحف أحمد وليلى',
      text: textToShare,
    };

    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        try {
          await navigator.clipboard.writeText(textToShare);
          setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة'));
        } catch {}
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(textToShare);
            setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة'));
          } catch {}
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(textToShare);
        setToastMessage(t('app_share.copied', 'تم نسخ نص المشاركة'));
      } catch {}
    }
  };

  return (
    <>
      <div
        id="share-app-card"
        dir={dir}
        className={`w-full p-5 sm:p-6 relative overflow-hidden select-none flex flex-col gap-3.5 ${
          isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white text-slate-800 tactile-3d-card-light'
        }`}
      >
        {/* 3D Glossy specular sheen */}
        <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
        <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
        <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

        {/* 1. الترويسة مع أيقونة المشاركة/العطاء */}
        <div className="flex items-center gap-2.5 w-full relative z-10">
          <div
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
            style={{
              backgroundColor: isBlackTheme ? 'rgba(251, 191, 36, 0.18)' : `${primaryColor}14`,
              color: primaryColor,
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
            }}
          >
            <HeartHandshake className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
          </div>
          <span className={`text-xs sm:text-sm font-bold tracking-tight font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
            {t('app_share.title', 'شارك التطبيق')}
          </span>
        </div>

        {/* آية كريمة وحديث شريف يحث على نشر الخير والدعوة إلى الله تحت نص شارك التطبيق */}
        <div 
          className={`w-full py-2 sm:py-2.5 px-3 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-1 relative z-10 ${
            isBlackTheme 
              ? 'bg-white/[0.04] border-amber-500/20' 
              : 'border-amber-200'
          }`}
          style={{
            backgroundColor: isBlackTheme ? undefined : `${primaryColor}0d`,
            borderColor: isBlackTheme ? undefined : `${primaryColor}24`,
          }}
        >
          <p 
            className="font-amiri text-[15px] sm:text-base font-bold leading-relaxed tracking-wide"
            style={{ color: isBlackTheme ? '#fbbf24' : primaryColor }}
          >
            {t('app_share.ayah', 'قال تعالى: ﴿ وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ ﴾')}
          </p>
          <p 
            className={`text-xs sm:text-[13px] font-medium leading-normal ${
              isBlackTheme ? 'text-zinc-300' : 'text-slate-600'
            }`}
          >
            {t('app_share.hadith', '« مَنْ دَلَّ عَلَى خَيْرٍ فَلَهُ مِثْلُ أَجْرِ فَاعِلِهِ »')}
          </p>
        </div>

        {/* 2. النص التشجيعي في المنتصف وبخط مريح ومسافات متوازنة */}
        <p className={`text-[13px] sm:text-[14px] font-normal leading-relaxed text-center px-1 sm:px-2 relative z-10 ${isBlackTheme ? 'text-zinc-300' : 'text-slate-600'}`}>
          {t(
            'app_share.desc',
            'اذا اعجبك التطبيق قم بنشره على وسائل التواصل ليكون لك الاجر ولمن تحب ان شاء الله .'
          )}
        </p>

        {/* 3. أزرار المشاركة والكيو ار والنسخ السفلية بتنسيق بارز ومجسم ثلاثي الأبعاد */}
        <div className="grid grid-cols-3 gap-2 sm:gap-2.5 pt-1 w-full max-w-sm sm:max-w-md mx-auto relative z-10">
          {/* زر المشاركة الرئيسي */}
          <button
            type="button"
            onClick={handleShareApp}
            className="py-2.5 px-2 sm:px-3 rounded-2xl font-bold font-kufi text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer relative overflow-hidden select-none"
            style={{
              backgroundColor: isBlackTheme ? '#d97706' : primaryColor,
              boxShadow: isBlackTheme
                ? '0 4px 0 #b45309, 0 6px 14px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
                : '0 4px 0 rgba(180, 83, 9, 0.4), 0 6px 14px rgba(180, 83, 9, 0.25), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
              border: 'none',
              color: '#FFFFFF'
            }}
            title={t('common.share', 'مشاركة')}
          >
            <div className="absolute inset-x-1 top-0.5 h-[45%] rounded-t-[12px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none" />

            <Share2 className="w-4 h-4 shrink-0 relative z-10 drop-shadow-xs" />
            <span className="truncate relative z-10 drop-shadow-xs">{t('common.share', 'مشاركة')}</span>
          </button>

          {/* زر الكيو ار بجوار زر المشاركة */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="py-2.5 px-2 sm:px-3 rounded-2xl font-bold font-kufi text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer relative overflow-hidden select-none"
            style={{
              backgroundColor: isBlackTheme ? '#d97706' : primaryColor,
              boxShadow: isBlackTheme
                ? '0 4px 0 #b45309, 0 6px 14px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
                : '0 4px 0 rgba(180, 83, 9, 0.4), 0 6px 14px rgba(180, 83, 9, 0.25), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
              border: 'none',
              color: '#FFFFFF'
            }}
            title={t('app_share.qr_button', 'الكيو ار')}
          >
            <div className="absolute inset-x-1 top-0.5 h-[45%] rounded-t-[12px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none" />

            <QrCode className="w-4 h-4 shrink-0 relative z-10 drop-shadow-xs" strokeWidth={2.2} />
            <span className="truncate relative z-10 drop-shadow-xs">{t('app_share.qr_button', 'الكيو ار')}</span>
          </button>

          {/* زر نسخ النص */}
          <button
            type="button"
            onClick={handleCopyText}
            className="py-2.5 px-2 sm:px-3 rounded-2xl font-bold font-kufi text-xs sm:text-sm text-white flex items-center justify-center gap-1.5 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer relative overflow-hidden select-none"
            style={{
              backgroundColor: isBlackTheme ? '#d97706' : primaryColor,
              boxShadow: isBlackTheme
                ? '0 4px 0 #b45309, 0 6px 14px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
                : '0 4px 0 rgba(180, 83, 9, 0.4), 0 6px 14px rgba(180, 83, 9, 0.25), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
              border: 'none',
              color: '#FFFFFF'
            }}
            title={t('common.copy', 'نسخ النص')}
          >
            <div className="absolute inset-x-1 top-0.5 h-[45%] rounded-t-[12px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
            <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none" />

            {copied ? (
              <>
                <Check className="w-4 h-4 shrink-0 text-white relative z-10 drop-shadow-xs" strokeWidth={2.4} />
                <span className="font-bold truncate text-white relative z-10 drop-shadow-xs">
                  {language === 'en' ? 'Copied' : 'تم النسخ'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 shrink-0 relative z-10 drop-shadow-xs" strokeWidth={2.2} />
                <span className="truncate relative z-10 drop-shadow-xs">{t('common.copy', 'نسخ')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* صفحة الكيو ار بكامل الشاشة */}
      <ShareAppQrModal isOpen={showQrModal} onClose={() => setShowQrModal(false)} />
    </>
  );
};

export default ShareAppCard;
