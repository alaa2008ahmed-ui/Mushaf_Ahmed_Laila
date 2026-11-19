import React from 'react';
import { createPortal } from 'react-dom';
import { Preferences } from '@capacitor/preferences';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const WHATS_NEW_RELEASE_KEY = 'whats_new_guide_seen_v1_0_7';

export function markWhatsNewAsSeen(): void {
  try {
    localStorage.setItem(WHATS_NEW_RELEASE_KEY, 'true');
  } catch {}
  Preferences.set({ key: WHATS_NEW_RELEASE_KEY, value: 'true' }).catch(() => {});
}

export async function hasSeenWhatsNew(): Promise<boolean> {
  try {
    if (localStorage.getItem(WHATS_NEW_RELEASE_KEY) === 'true') {
      return true;
    }
  } catch {}

  try {
    const { value } = await Preferences.get({ key: WHATS_NEW_RELEASE_KEY });
    if (value === 'true') {
      try {
        localStorage.setItem(WHATS_NEW_RELEASE_KEY, 'true');
      } catch {}
      return true;
    }
  } catch {}

  return false;
}

interface WhatsNewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface UpdateEntry {
  id: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

const NEW_PAGES_ITEMS: UpdateEntry[] = [
  {
    id: 'seerah',
    titleAr: 'صفحة السيرة النبوية',
    titleEn: 'Prophetic Seerah Page',
    descAr: 'استعراض شيّق ومرتّب لأهم محطات وحياة النبي ﷺ عبر خط زمني مبسّط.',
    descEn: 'An engaging chronological timeline of the noble life and milestones of Prophet Muhammad ﷺ.',
  },
  {
    id: 'ten-promised',
    titleAr: 'العشرة المبشرون بالجنة',
    titleEn: 'Ten Promised Paradise',
    descAr: 'تعرّف على سير ومناقب الصحابة الكرام المبشرين بالجنة بأسلوب ميسّر وواضح.',
    descEn: 'Inspiring biographies and virtues of the ten noble Companions promised Paradise.',
  },
  {
    id: 'divine-miracles',
    titleAr: 'معجزات إلهية',
    titleEn: 'Divine Miracles',
    descAr: 'تأمّلات قرآنية وكونية موثّقة تُبرز بديع صنع الله وعظمته في الخلق.',
    descEn: 'Documented Qur’anic and cosmic reflections highlighting the majesty of Allah’s creation.',
  },
  {
    id: 'ruqyah',
    titleAr: 'الرقية الشرعية',
    titleEn: 'Ruqyah Shariah',
    descAr: 'آيات قرآنية وأدعية نبوية صحيحة ومرتّبة للتحصين والسكينة والطمأنينة.',
    descEn: 'Authentic Qur’anic verses and Prophetic supplications for protection, healing, and serenity.',
  },
  {
    id: 'bilingual',
    titleAr: 'دعم اللغتين العربية والإنجليزية',
    titleEn: 'Full Arabic & English Support',
    descAr: 'تجربة ثنائية اللغة بالكامل تتيح التبديل الفوري بين العربية والإنجليزية في كافة الأقسام.',
    descEn: 'Seamless bilingual experience across interfaces and content with instant language switching.',
  },
];

const IMPROVEMENTS_ITEMS: UpdateEntry[] = [
  {
    id: 'more-adia-adhkar',
    titleAr: 'إضافة الكثير من الأدعية والأذكار',
    titleEn: 'Expanded Supplications & Adhkar',
    descAr: 'إثراء صفحات الأدعية والأذكار بباقة كبيرة ومتنوعة من الأدعية والأذكار المأثورة.',
    descEn: 'Enriched the supplications and adhkar pages with an extensive new collection of authentic prayers.',
  },
  {
    id: 'new-page-sections',
    titleAr: 'إضافة أقسام جديدة بالصفحات',
    titleEn: 'New Sections Across Pages',
    descAr: 'إضافة أقسام وتصنيفات جديدة ومنظّمة داخل الصفحات لتسهيل الوصول والتصفح.',
    descEn: 'Added newly organized sections and categories within pages for faster browsing and access.',
  },
  {
    id: 'bug-fixes',
    titleAr: 'معالجة أخطاء الإصدار السابق',
    titleEn: 'Previous Version Bug Fixes',
    descAr: 'إصلاح الملاحظات السابقة وتحسين دقة التنبيهات والأذان واستقرار الأداء العام.',
    descEn: 'Resolved issues from the previous release for sharper alerts and smoother stability.',
  },
  {
    id: 'all-pages-upgrade',
    titleAr: 'إضافات وتحديثات لكامل الصفحات',
    titleEn: 'App-Wide Additions & Updates',
    descAr: 'تطوير شامل للتصميم والألوان والثيمات وإضافة تحسينات ذكية في جميع صفحات التطبيق.',
    descEn: 'Refreshed layouts, adaptive themes, and thoughtful enhancements across every app page.',
  },
];

const WhatsNewModal: React.FC<WhatsNewModalProps> = ({ isOpen, onClose }) => {
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const { language, dir } = useLanguage();
  const isEn = language === 'en';

  if (!isOpen || typeof document === 'undefined') return null;

  const isBlackTheme = Boolean(
    isNightMode ||
      themeKey === 'deep_black' ||
      theme?.bgColor === '#000000' ||
      theme?.name === 'اسود' ||
      theme?.name === 'black'
  );
  const isSkyTheme = !isBlackTheme && (themeKey === 'sky_mode' || homeThemeVariant === 'sky');
  const isEmeraldTheme = !isBlackTheme && (themeKey === 'emerald_mode' || homeThemeVariant === 'emerald');
  const isBurgundyTheme = !isBlackTheme && (themeKey === 'burgundy_mode' || homeThemeVariant === 'burgundy');

  const styles = (() => {
    if (isBlackTheme) {
      return {
        modalBg: 'linear-gradient(168deg, #1b1b22 0%, #121216 55%, #0b0b0f 100%)',
        cardBg: '#18181b',
        dividerColor: 'rgba(255, 255, 255, 0.12)',
        accent: '#F59E0B',
        badgeBg: '#27272a',
        badgeText: '#FCD34D',
        badgeShadow:
          '0 3.5px 0 #09090b, 0 6px 12px rgba(0, 0, 0, 0.65), inset 0 1.5px 1px rgba(255, 255, 255, 0.18)',
        titleColor: '#FFFFFF',
        subtextColor: '#D4D4D8',
        sectionTitleColor: '#FBBF24',
        closeBtnBg: 'linear-gradient(180deg, #F59E0B 0%, #D97706 100%)',
        closeBtnText: '#09090B',
        closeBtnShadow:
          '0 4.5px 0 #78350F, 0 10px 20px rgba(245, 158, 11, 0.28), inset 0 1.5px 1px rgba(255,255,255,0.45)',
        modalShadow:
          '0 9px 0 #050507, 0 26px 54px rgba(0, 0, 0, 0.9), inset 0 2px 2px rgba(255, 255, 255, 0.16), inset 0 -3px 6px rgba(0, 0, 0, 0.65)',
      };
    }

    if (isSkyTheme) {
      return {
        modalBg: 'linear-gradient(168deg, #F0F9FF 0%, #E0F2FE 100%)',
        cardBg: '#FFFFFF',
        dividerColor: 'rgba(2, 132, 199, 0.16)',
        accent: '#0284C7',
        badgeBg: '#FFFFFF',
        badgeText: '#0369A1',
        badgeShadow:
          '0 3.5px 0 rgba(2, 132, 199, 0.2), 0 6px 12px rgba(2, 132, 199, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
        titleColor: '#0F172A',
        subtextColor: '#475569',
        sectionTitleColor: '#0369A1',
        closeBtnBg: 'linear-gradient(180deg, #0284C7 0%, #0369A1 100%)',
        closeBtnText: '#FFFFFF',
        closeBtnShadow:
          '0 4.5px 0 #075985, 0 10px 20px rgba(2, 132, 199, 0.28), inset 0 1.5px 1px rgba(255,255,255,0.4)',
        modalShadow:
          '0 9px 0 rgba(2, 132, 199, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(2, 132, 199, 0.1)',
      };
    }

    if (isEmeraldTheme) {
      return {
        modalBg: 'linear-gradient(168deg, #F0FDF4 0%, #DCFCE7 100%)',
        cardBg: '#FFFFFF',
        dividerColor: 'rgba(5, 150, 105, 0.16)',
        accent: '#059669',
        badgeBg: '#FFFFFF',
        badgeText: '#047857',
        badgeShadow:
          '0 3.5px 0 rgba(5, 150, 105, 0.2), 0 6px 12px rgba(5, 150, 105, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
        titleColor: '#0F172A',
        subtextColor: '#475569',
        sectionTitleColor: '#047857',
        closeBtnBg: 'linear-gradient(180deg, #059669 0%, #047857 100%)',
        closeBtnText: '#FFFFFF',
        closeBtnShadow:
          '0 4.5px 0 #065F46, 0 10px 20px rgba(5, 150, 105, 0.28), inset 0 1.5px 1px rgba(255,255,255,0.4)',
        modalShadow:
          '0 9px 0 rgba(5, 150, 105, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(5, 150, 105, 0.1)',
      };
    }

    if (isBurgundyTheme) {
      return {
        modalBg: 'linear-gradient(168deg, #FFF1F2 0%, #FFE4E6 100%)',
        cardBg: '#FFFFFF',
        dividerColor: 'rgba(190, 18, 60, 0.15)',
        accent: '#BE123C',
        badgeBg: '#FFFFFF',
        badgeText: '#881337',
        badgeShadow:
          '0 3.5px 0 rgba(159, 18, 57, 0.2), 0 6px 12px rgba(159, 18, 57, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
        titleColor: '#0F172A',
        subtextColor: '#475569',
        sectionTitleColor: '#9F1239',
        closeBtnBg: 'linear-gradient(180deg, #BE123C 0%, #881337 100%)',
        closeBtnText: '#FFFFFF',
        closeBtnShadow:
          '0 4.5px 0 #4C0519, 0 10px 20px rgba(159, 18, 57, 0.28), inset 0 1.5px 1px rgba(255,255,255,0.4)',
        modalShadow:
          '0 9px 0 rgba(159, 18, 57, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(159, 18, 57, 0.1)',
      };
    }

    // Default Gold Theme
    return {
      modalBg: 'linear-gradient(168deg, #FFFDF2 0%, #FEF9C3 100%)',
      cardBg: '#FFFFFF',
      dividerColor: 'rgba(180, 83, 9, 0.16)',
      accent: '#CA8A04',
      badgeBg: '#FFFFFF',
      badgeText: '#92400E',
      badgeShadow:
        '0 3.5px 0 rgba(180, 83, 9, 0.2), 0 6px 12px rgba(180, 83, 9, 0.12), inset 0 1.5px 1px rgba(255, 255, 255, 0.96)',
      titleColor: '#1C1917',
      subtextColor: '#57534E',
      sectionTitleColor: '#B45309',
      closeBtnBg: 'linear-gradient(180deg, #D97706 0%, #B45309 100%)',
      closeBtnText: '#FFFFFF',
      closeBtnShadow:
        '0 4.5px 0 #78350F, 0 10px 20px rgba(180, 83, 9, 0.28), inset 0 1.5px 1px rgba(255,255,255,0.4)',
      modalShadow:
        '0 9px 0 rgba(180, 83, 9, 0.22), 0 26px 52px rgba(15, 23, 42, 0.3), inset 0 2.5px 2px rgba(255, 255, 255, 0.98), inset 0 -3px 6px rgba(180, 83, 9, 0.1)',
    };
  })();

  const handleDismiss = () => {
    markWhatsNewAsSeen();
    onClose();
  };

  const renderSection = (title: string, items: UpdateEntry[]) => (
    <div className="space-y-2.5">
      <div className="px-1">
        <h3
          className="text-[11px] sm:text-xs font-black tracking-wide"
          style={{ color: styles.sectionTitleColor }}
        >
          {title}
        </h3>
      </div>

      <div className="space-y-3 pb-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="app-page-card border-0 p-3 sm:p-3.5 rounded-2xl space-y-1"
            style={{
              backgroundColor: styles.cardBg,
            }}
          >
            <h4
              className="text-xs sm:text-[13px] font-black leading-snug"
              style={{ color: styles.titleColor }}
            >
              {isEn ? item.titleEn : item.titleAr}
            </h4>
            <p
              className="text-[11px] leading-relaxed font-semibold"
              style={{ color: styles.subtextColor }}
            >
              {isEn ? item.descEn : item.descAr}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div
      id="whats-new-modal-backdrop"
      className="fixed inset-0 z-[10000000] bg-black/60 backdrop-blur-[2px] flex items-center justify-center p-4 font-cairo select-none animate-in fade-in duration-200"
      onClick={handleDismiss}
      dir={dir}
    >
      <div
        id="whats-new-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-new-modal-title"
        onClick={(e) => e.stopPropagation()}
        className={`settings-3d-adia-scope ${isBlackTheme ? 'settings-3d-dark' : ''} w-full max-w-[345px] sm:max-w-[390px] max-h-[75dvh] rounded-[2rem] flex flex-col overflow-hidden border-0 animate-in zoom-in-95 duration-200`}
        style={{
          background: styles.modalBg,
          color: styles.titleColor,
          boxShadow: styles.modalShadow,
        }}
      >
        {/* Compact 3D Header */}
        <div
          className="px-4 pt-4 pb-3 shrink-0 border-b"
          style={{ borderColor: styles.dividerColor }}
        >
          <div className="flex items-center justify-between gap-2">
            <h2
              id="whats-new-modal-title"
              className="text-sm sm:text-base font-black truncate"
              style={{ color: styles.titleColor }}
            >
              {isEn ? "What's New in the App" : 'ما الجديد في هذا التحديث'}
            </h2>
            <span
              className="app-3d-badge border-0 text-[10px] font-black px-2.5 py-0.5 rounded-full shrink-0"
              style={{
                backgroundColor: styles.badgeBg,
                color: styles.badgeText,
                boxShadow: styles.badgeShadow,
              }}
            >
              {isEn ? 'v1.0.7' : 'إصدار 1.0.7'}
            </span>
          </div>
          <p
            className="text-[11px] font-semibold leading-snug mt-1 truncate"
            style={{ color: styles.subtextColor }}
          >
            {isEn
              ? 'New faith sections & overall refinements'
              : 'صفحات جديدة وتحديثات شاملة لتجربة أفضل'}
          </p>
        </div>

        {/* Scrollable 3D Cards Content */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-4 no-scrollbar">
          {renderSection(
            isEn ? 'New Sections Added' : 'الصفحات والإضافات الجديدة',
            NEW_PAGES_ITEMS
          )}
          {renderSection(
            isEn ? 'Updates & Enhancements' : 'التحديثات والتحسينات الشاملة',
            IMPROVEMENTS_ITEMS
          )}
        </div>

        {/* Small 3D Close Button Footer */}
        <div
          className="px-4 py-3 shrink-0 border-t flex items-center justify-center"
          style={{ borderColor: styles.dividerColor }}
        >
          <button
            id="btn-close-whats-new"
            type="button"
            onClick={handleDismiss}
            className="unified-3d-btn px-7 py-1.5 rounded-xl text-xs font-black flex items-center justify-center cursor-pointer transition-transform active:scale-95 border-0"
            style={{
              background: styles.closeBtnBg,
              color: styles.closeBtnText,
              boxShadow: styles.closeBtnShadow,
            }}
          >
            <span>{isEn ? 'Close' : 'إغلاق'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WhatsNewModal;
