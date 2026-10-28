import React, { useState } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Copy, 
  Share2, 
  Check 
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { Share as CapacitorShare } from '@capacitor/share';

interface WebAppCardProps {
  setToastMessage: (msg: string) => void;
}

const WEB_APP_URL = 'https://mushaf-ahmed-laila.vercel.app/';

export const WebAppCard: React.FC<WebAppCardProps> = ({ setToastMessage }) => {
  const { language, dir, t } = useLanguage();
  const { theme, themeKey } = useTheme();
  const [copied, setCopied] = useState(false);

  const isBlackTheme = themeKey === 'deep_black' || theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
  const primaryColor = isBlackTheme ? '#10b981' : (theme.palette?.[0] || '#059669');

  const handleOpenLink = () => {
    window.open(WEB_APP_URL, '_blank');
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(WEB_APP_URL);
      setCopied(true);
      setToastMessage(t('webapp.copied', 'تم نسخ الرابط'));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setToastMessage(t('common.failed_copy', 'فشل في النسخ'));
    }
  };

  const handleShareLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: language === 'en' ? 'Mushaf Ahmed & Laila Web App' : 'تطبيق مصحف أحمد و ليلى',
      text: language === 'en'
        ? `To open the app on your browser or iPhone, tap the link:\n${WEB_APP_URL}`
        : `لمشاهدة التطبيق على المتصفح أو الآيفون اضغط على الرابط التالي:\n${WEB_APP_URL}`,
    };

    if (Capacitor.isNativePlatform()) {
      try {
        await CapacitorShare.share(shareData);
      } catch {
        try {
          await navigator.clipboard.writeText(shareData.text);
          setToastMessage(t('webapp.copied', 'تم نسخ الرابط'));
        } catch {}
      }
    } else if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(shareData.text);
            setToastMessage(t('webapp.copied', 'تم نسخ الرابط'));
          } catch {}
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareData.text);
        setToastMessage(t('webapp.copied', 'تم نسخ الرابط'));
      } catch {}
    }
  };

  return (
    <div
      id="web-app-card"
      dir={dir}
      className={`w-full p-5 sm:p-6 relative overflow-hidden select-none flex flex-col gap-3.5 ${
        isBlackTheme ? 'bg-[#18181b] text-white tactile-3d-card-dark' : 'bg-white text-slate-800 tactile-3d-card-light'
      }`}
    >
      {/* 3D Glossy specular sheen */}
      <div className="absolute inset-x-2 top-0.5 h-[35%] rounded-t-[18px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
      <div className="absolute inset-x-6 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/85 to-transparent rounded-full pointer-events-none" />
      <div className="absolute inset-x-4 bottom-0 h-[2px] bg-black/10 rounded-b-[20px] pointer-events-none" />

      {/* 1. الترويسة مع أيقونة الكرة الأرضية */}
      <div className="flex items-center gap-2.5 w-full relative z-10">
        <div
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs"
          style={{
            backgroundColor: isBlackTheme ? 'rgba(16, 185, 129, 0.18)' : `${primaryColor}14`,
            color: primaryColor,
            boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.4)',
          }}
        >
          <Globe className="w-4 h-4 sm:w-4.5 sm:h-4.5" strokeWidth={2.2} />
        </div>
        <span className={`text-xs sm:text-sm font-bold tracking-tight font-kufi ${isBlackTheme ? 'text-white' : 'text-slate-800'}`}>
          {t('webapp.title', 'تصفح التطبيق')}
        </span>
      </div>

      {/* 2. النص التوضيحي مع مسافة بادئة مريحة للعين */}
      <p className={`text-[13.5px] sm:text-[14.5px] font-normal leading-relaxed relative z-10 ${isBlackTheme ? 'text-zinc-300' : 'text-slate-600'}`}>
        {t('webapp.desc', 'لمشاهدة التطبيق على المتصفح أو الآيفون، اضغط على الرابط للاستخدام المباشر دون تثبيت.')}
      </p>

      {/* 3. توحيد نمط الأزرار: أزرار مجسمة ثلاثية الأبعاد */}
      <div className="flex items-center justify-between gap-3 pt-1 relative z-10">
        {/* زر فتح الرابط الممتلئ (3D Raised Filled Button) */}
        <button
          type="button"
          onClick={handleOpenLink}
          className="flex-1 py-2.5 px-4 rounded-2xl font-bold font-kufi text-xs sm:text-sm text-white flex items-center justify-center gap-2 active:scale-95 active:translate-y-0.5 transition-all cursor-pointer relative overflow-hidden select-none"
          style={{
            backgroundColor: isBlackTheme ? '#10b981' : primaryColor,
            boxShadow: isBlackTheme
              ? '0 4px 0 #059669, 0 6px 14px rgba(0, 0, 0, 0.6), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.3)'
              : '0 4px 0 rgba(0, 0, 0, 0.22), 0 6px 14px rgba(0, 0, 0, 0.15), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)',
            border: 'none',
            color: '#FFFFFF'
          }}
          title={t('webapp.open', 'فتح الرابط')}
        >
          {/* Top gloss */}
          <div className="absolute inset-x-1 top-0.5 h-[45%] rounded-t-[12px] bg-gradient-to-b from-white/35 via-white/10 to-transparent pointer-events-none" />
          <div className="absolute inset-x-2 bottom-0 h-[2px] bg-black/15 rounded-b-2xl pointer-events-none" />

          <span className="relative z-10 drop-shadow-xs">{t('webapp.open', 'فتح الرابط')}</span>
          <ExternalLink className="w-4 h-4 relative z-10 drop-shadow-xs" />
        </button>

        {/* أزرار مجسمة ثلاثية الأبعاد */}
        <div className="flex items-center gap-2 shrink-0">
          {/* زر نسخ الرابط */}
          <button
            type="button"
            onClick={handleCopyLink}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 select-none ${
              isBlackTheme
                ? 'bg-zinc-800 text-zinc-200'
                : 'bg-slate-50 text-slate-800'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 3px 0 #18181b, 0 4px 10px rgba(0,0,0,0.5), inset 0 1.5px 1.5px rgba(255,255,255,0.2)'
                : '0 3px 0 rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('webapp.copy', 'نسخ الرابط')}
            aria-label={t('webapp.copy', 'نسخ الرابط')}
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.6} />
            ) : (
              <Copy className="w-4 h-4 drop-shadow-xs" strokeWidth={2.4} />
            )}
          </button>

          {/* زر مشاركة الرابط */}
          <button
            type="button"
            onClick={handleShareLink}
            className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all cursor-pointer active:scale-90 active:translate-y-0.5 select-none ${
              isBlackTheme
                ? 'bg-zinc-800 text-zinc-200'
                : 'bg-slate-50 text-slate-800'
            }`}
            style={{
              boxShadow: isBlackTheme
                ? '0 3px 0 #18181b, 0 4px 10px rgba(0,0,0,0.5), inset 0 1.5px 1.5px rgba(255,255,255,0.2)'
                : '0 3px 0 rgba(0, 0, 0, 0.15), 0 4px 10px rgba(0, 0, 0, 0.08), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.9)',
              border: isBlackTheme ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
            }}
            title={t('webapp.share', 'مشاركة الرابط')}
            aria-label={t('webapp.share', 'مشاركة الرابط')}
          >
            <Share2 className="w-4 h-4 drop-shadow-xs" strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebAppCard;
