import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  MessageSquareWarning,
  Search,
  X,
  Copy,
  CheckCircle2,
  Send,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { registerBackInterceptor } from '../../hooks/useBackButton';
import { showGlobalAppToast } from '../../utils/appNotificationSettings';
import {
  APPROVED_SOURCES_PAGES,
  ApprovedSourcePageId,
} from '../../data/approvedSourcesData';

interface ApprovedSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHome: () => void;
}

export const ApprovedSourcesModal: React.FC<ApprovedSourcesModalProps> = ({
  isOpen,
  onClose,
  onHome,
}) => {
  const { language, t } = useLanguage();
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const isEn = language === 'en';

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [selectedPageId, setSelectedPageId] = useState<ApprovedSourcePageId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportSection, setReportSection] = useState<string>('general');
  const [reportText, setReportText] = useState('');
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  // Reset navigation & search whenever modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedPageId(null);
      setSearchQuery('');
      setIsReportOpen(false);
    }
  }, [isOpen]);

  // Scroll to top whenever transitioning between pages directory and a page's sources
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [selectedPageId]);

  // Determine active 5-theme visual tokens matching HomeScreenSettingsModal.tsx
  const isSkyTheme = homeThemeVariant === 'sky';
  const isEmeraldTheme = homeThemeVariant === 'emerald';
  const isBurgundyTheme = homeThemeVariant === 'burgundy';
  const isBlackTheme =
    isNightMode ||
    themeKey === 'deep_black' ||
    theme?.bgColor === '#000000' ||
    theme?.name === 'اسود' ||
    theme?.name === 'black';

  const pageBgColor = isBlackTheme
    ? '#000000'
    : theme?.bgColor && theme.bgColor.toLowerCase() !== '#ffffff'
      ? theme.bgColor
      : isSkyTheme
        ? '#F0F9FF'
        : isEmeraldTheme
          ? '#F0FDF4'
          : isBurgundyTheme
            ? '#FFF1F2'
            : '#FEF9C3';

  const themeAccentColor = isBlackTheme
    ? '#f59e0b'
    : isSkyTheme
      ? '#0284c7'
      : isEmeraldTheme
        ? '#047857'
        : isBurgundyTheme
          ? '#881337'
          : theme.palette?.[0] || '#ca8a04';

  const themeAccentDeep = isBlackTheme
    ? '#d97706'
    : isSkyTheme
      ? '#0369a1'
      : isEmeraldTheme
        ? '#065f46'
        : isBurgundyTheme
          ? '#881337'
          : '#b45309';

  const surfaceBgColor = isBlackTheme
    ? '#18181f'
    : isSkyTheme
      ? '#f5faff'
      : isEmeraldTheme
        ? '#f4fbf7'
        : isBurgundyTheme
          ? '#fef4f6'
          : '#fffbeb';

  const surfaceTextColor = isBlackTheme ? '#ffffff' : '#0f172a';
  const mutedTextColor = isBlackTheme ? '#d4d4d8' : '#334155';
  const subtleBorderColor = isBlackTheme
    ? 'rgba(245, 158, 11, 0.25)'
    : isSkyTheme
      ? 'rgba(2, 132, 199, 0.25)'
      : isEmeraldTheme
        ? 'rgba(4, 120, 87, 0.25)'
        : isBurgundyTheme
          ? 'rgba(136, 19, 55, 0.25)'
          : 'rgba(180, 83, 9, 0.25)';

  // LIFO Back Interceptor: closes Report modal first, then Page detail -> Pages list, then closes Modal
  const backStateRef = useRef({ isReportOpen, selectedPageId, onClose });
  backStateRef.current = { isReportOpen, selectedPageId, onClose };

  useEffect(() => {
    if (!isOpen) return;
    const unregister = registerBackInterceptor(() => {
      if (backStateRef.current.isReportOpen) {
        setIsReportOpen(false);
        return true;
      }
      if (backStateRef.current.selectedPageId !== null) {
        setSelectedPageId(null);
        return true;
      }
      backStateRef.current.onClose();
      return true;
    });
    return unregister;
  }, [isOpen]);

  const selectedPage = useMemo(
    () => APPROVED_SOURCES_PAGES.find((p) => p.id === selectedPageId) || null,
    [selectedPageId]
  );

  const filteredPages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return APPROVED_SOURCES_PAGES;
    return APPROVED_SOURCES_PAGES.filter((page) => {
      if (
        page.titleAr.toLowerCase().includes(q) ||
        page.titleEn.toLowerCase().includes(q) ||
        page.subtitleAr.toLowerCase().includes(q) ||
        page.subtitleEn.toLowerCase().includes(q)
      ) {
        return true;
      }
      return page.items.some(
        (item) =>
          item.titleAr.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          (item.authorOrOrgAr?.toLowerCase().includes(q) ?? false) ||
          (item.authorOrOrgEn?.toLowerCase().includes(q) ?? false) ||
          item.detailAr.toLowerCase().includes(q) ||
          item.detailEn.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  if (!isOpen) return null;

  const selectedCategoryLabel = (() => {
    if (reportSection === 'general') {
      return t('approved_sources.report_general_linguistic');
    }
    const found = APPROVED_SOURCES_PAGES.find((p) => p.id === reportSection);
    return found ? (isEn ? found.titleEn : found.titleAr) : reportSection;
  })();

  const formattedReportMessage = isEn
    ? `[App Feedback / Correction]\nPage: ${selectedCategoryLabel}\nDetails: ${reportText.trim()}`
    : `[ملاحظة / تصحيح لغوي أو علمي]\nالصفحة: ${selectedCategoryLabel}\nالتفاصيل: ${reportText.trim()}`;

  const handleCopyReport = async () => {
    if (!reportText.trim()) {
      showGlobalAppToast(t('approved_sources.report_empty_error'));
      return;
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(formattedReportMessage);
      }
      setCopiedFeedback(true);
      showGlobalAppToast(t('approved_sources.report_copied_toast'));
      setTimeout(() => setCopiedFeedback(false), 2500);
    } catch {
      showGlobalAppToast(t('approved_sources.report_copied_toast'));
    }
  };

  const whatsappHref = reportText.trim()
    ? `https://wa.me/966592166023?text=${encodeURIComponent(formattedReportMessage)}`
    : undefined;

  const handleHeaderBack = () => {
    if (selectedPage) {
      setSelectedPageId(null);
    } else {
      onClose();
    }
  };

  const handleHeaderHome = () => {
    setSelectedPageId(null);
    onHome();
  };

  const openReportFor = (sectionId: string) => {
    setReportSection(sectionId);
    setIsReportOpen(true);
  };

  return (
    <motion.div
      id="approved-sources-modal"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 18 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="fixed inset-0 z-[9999999] flex flex-col font-cairo select-none overflow-hidden"
      style={{ backgroundColor: pageBgColor }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Top Bar matching HomeScreenSettingsModal & other app pages */}
      <header
        className="app-top-bar settings-top-bar shrink-0 w-full"
        dir={isEn ? 'ltr' : 'rtl'}
        style={{ display: 'block' }}
      >
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-center w-full min-h-[44px]">
            {/* Back Button */}
            <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
              <button
                type="button"
                id="btn-approved-sources-back"
                onClick={handleHeaderBack}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={
                  selectedPage
                    ? t('approved_sources.back_to_pages')
                    : isEn
                      ? 'Go Back'
                      : 'رجوع للخلف'
                }
                aria-label={
                  selectedPage
                    ? t('approved_sources.back_to_pages')
                    : isEn
                      ? 'Go Back'
                      : 'رجوع للخلف'
                }
              >
                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
            </div>

            {/* Centered Title */}
            <div className="text-center px-11 min-w-0 w-full">
              <h1
                className="app-top-bar__title font-kufi whitespace-nowrap leading-tight"
                style={{
                  fontSize: selectedPage
                    ? 'clamp(0.84rem, 3.6vw, 1.15rem)'
                    : 'clamp(0.92rem, 4vw, 1.2rem)',
                }}
              >
                {selectedPage
                  ? isEn
                    ? selectedPage.titleEn
                    : selectedPage.titleAr
                  : t('approved_sources.title')}
              </h1>
            </div>

            {/* Home Button */}
            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
              <button
                type="button"
                onClick={handleHeaderHome}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
              >
                <i className="fa-solid fa-house text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pt-5 pb-10 app-scroll-safe space-y-4 no-scrollbar max-w-2xl mx-auto w-full"
      >
        {!selectedPage ? (
          /* ================= LEVEL 1: APPLICATION PAGES DIRECTORY ================= */
          <div className="space-y-4">
            {/* 1. Search Input (kept outside white-3d-container-card for clean Night Mode contrast) */}
            <div
                className="relative flex items-center rounded-2xl px-3.5 min-h-[46px]"
                style={{
                  backgroundColor: surfaceBgColor,
                  border: `1.5px solid ${subtleBorderColor}`,
                }}
              >
                <Search
                  size={18}
                  className="shrink-0 opacity-75"
                  style={{ color: themeAccentColor }}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('approved_sources.search_placeholder')}
                  className="w-full bg-transparent px-2.5 py-2 text-sm font-bold outline-none"
                  style={{ color: surfaceTextColor }}
                />
                {searchQuery.trim() && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label={isEn ? 'Clear search' : 'مسح البحث'}
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer"
                    style={{ color: mutedTextColor }}
                  >
                    <X size={15} />
                  </button>
                )}
            </div>

            {/* 3. Clickable App Pages List */}
            {filteredPages.length === 0 ? (
              <div
                className="p-6 rounded-3xl text-center font-bold text-sm"
                style={{
                  backgroundColor: surfaceBgColor,
                  color: mutedTextColor,
                  border: `1px solid ${subtleBorderColor}`,
                }}
              >
                {t('approved_sources.no_results')}
              </div>
            ) : (
              <div className="space-y-2.5" id="approved-sources-pages-list">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    type="button"
                    id={`btn-source-page-${page.id}`}
                    onClick={() => setSelectedPageId(page.id)}
                    className="w-full min-h-[56px] px-4 py-3.5 rounded-2xl flex items-center justify-between gap-3 transition-all active:scale-[0.985] cursor-pointer white-3d-card-btn text-start"
                  >
                    <div className="text-sm sm:text-[15px] font-black leading-snug min-w-0 flex-1">
                      {isEn ? page.titleEn : page.titleAr}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* 4. Sharia Disclaimer Card + Report Correction Action */}
            <div
              className="p-4 sm:p-5 rounded-3xl space-y-3.5"
              style={{
                backgroundColor: surfaceBgColor,
                border: `1.5px solid ${subtleBorderColor}`,
                boxShadow: isBlackTheme
                  ? '0 8px 24px rgba(0, 0, 0, 0.65)'
                  : '0 6px 18px rgba(15, 23, 42, 0.06)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `${themeAccentColor}1F`,
                    color: themeAccentColor,
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <h3
                  className="text-base sm:text-lg font-black"
                  style={{ color: isBlackTheme ? '#FBBF24' : themeAccentDeep }}
                >
                  {t('approved_sources.disclaimer_title')}
                </h3>
              </div>

              <p
                className="text-xs sm:text-sm leading-relaxed font-bold select-text"
                style={{ color: mutedTextColor }}
              >
                {t('approved_sources.disclaimer_body')}
              </p>

              <button
                type="button"
                id="btn-report-source-correction"
                onClick={() => openReportFor('general')}
                className="w-full min-h-[48px] px-4 py-3 rounded-2xl font-black text-sm sm:text-[15px] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer"
                style={{
                  backgroundColor: themeAccentColor,
                  color: isBlackTheme ? '#000000' : '#FFFFFF',
                }}
              >
                <MessageSquareWarning size={19} className="shrink-0" />
                <span>{t('approved_sources.report_btn')}</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= LEVEL 2: SELECTED PAGE SOURCES DETAIL VIEW ================= */
          <div className="space-y-4" id={`page-sources-detail-${selectedPage.id}`}>
            {/* Selected Page Sources Card */}
            <section
              aria-label={isEn ? selectedPage.titleEn : selectedPage.titleAr}
              className="p-4 sm:p-5 rounded-3xl white-3d-container-card"
            >
              {/* Page Sources Bulleted List */}
              <ul className="space-y-3.5 m-0 p-0 list-none">
                {selectedPage.items.map((item) => {
                  const authorText = isEn ? item.authorOrOrgEn : item.authorOrOrgAr;
                  return (
                    <li
                      key={item.id}
                      className="flex items-start gap-2.5 select-text"
                    >
                      <span
                        aria-hidden="true"
                        className="w-2 h-2 rounded-full shrink-0 mt-2"
                        style={{ backgroundColor: themeAccentColor }}
                      />
                      <div className="min-w-0 flex-1 space-y-1">
                        <h3
                          className="text-sm sm:text-[15px] font-black leading-snug"
                          style={{ color: isBlackTheme ? '#ffffff' : '#0f172a' }}
                        >
                          {isEn ? item.titleEn : item.titleAr}
                        </h3>
                        {authorText && (
                          <p
                            className="text-xs font-extrabold leading-snug gold-accent-text"
                            style={!isBlackTheme ? { color: themeAccentDeep } : undefined}
                          >
                            {authorText}
                          </p>
                        )}
                        <p
                          className="text-xs sm:text-[13px] font-semibold leading-relaxed opacity-90"
                          style={{ color: isBlackTheme ? '#e4e4e7' : '#334155' }}
                        >
                          {isEn ? item.detailEn : item.detailAr}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>

            {/* Sharia Disclaimer Card (shown on Calculators internal page) */}
            {selectedPage.id === 'calculators' && (
              <div
                className="p-4 sm:p-5 rounded-3xl space-y-3.5"
                style={{
                  backgroundColor: surfaceBgColor,
                  border: `1.5px solid ${subtleBorderColor}`,
                  boxShadow: isBlackTheme
                    ? '0 8px 24px rgba(0, 0, 0, 0.65)'
                    : '0 6px 18px rgba(15, 23, 42, 0.06)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: `${themeAccentColor}1F`,
                      color: themeAccentColor,
                    }}
                  >
                    <AlertTriangle size={20} />
                  </div>
                  <h3
                    className="text-base sm:text-lg font-black"
                    style={{ color: isBlackTheme ? '#FBBF24' : themeAccentDeep }}
                  >
                    {t('approved_sources.disclaimer_title')}
                  </h3>
                </div>

                <p
                  className="text-xs sm:text-sm leading-relaxed font-bold select-text"
                  style={{ color: mutedTextColor }}
                >
                  {t('approved_sources.disclaimer_body')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Report Note or Linguistic Correction Sheet */}
      <AnimatePresence>
        {isReportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999999] bg-black/65 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsReportOpen(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.18 }}
              dir={isEn ? 'ltr' : 'rtl'}
              className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl"
              style={{
                backgroundColor: isBlackTheme ? '#18181f' : '#FFFFFF',
                color: isBlackTheme ? '#FFFFFF' : '#0f172a',
                border: `1.5px solid ${subtleBorderColor}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3
                    className="text-lg font-black"
                    style={{ color: isBlackTheme ? '#FBBF24' : themeAccentDeep }}
                  >
                    {t('approved_sources.report_modal_title')}
                  </h3>
                  <p className="text-xs sm:text-sm font-semibold opacity-80">
                    {t('approved_sources.report_modal_subtitle')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportOpen(false)}
                  aria-label={isEn ? 'Close' : 'إغلاق'}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 cursor-pointer transition-all hover:bg-black/10 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="report-section-select"
                  className="block text-xs sm:text-sm font-black"
                >
                  {t('approved_sources.report_section_label')}
                </label>
                <select
                  id="report-section-select"
                  value={reportSection}
                  onChange={(e) => setReportSection(e.target.value)}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl text-sm font-bold outline-none"
                  style={{
                    backgroundColor: isBlackTheme ? '#272732' : '#f8fafc',
                    color: isBlackTheme ? '#FFFFFF' : '#0f172a',
                    border: `1px solid ${subtleBorderColor}`,
                  }}
                >
                  <option value="general">
                    {t('approved_sources.report_general_linguistic')}
                  </option>
                  {APPROVED_SOURCES_PAGES.map((page) => (
                    <option key={page.id} value={page.id}>
                      {isEn ? page.titleEn : page.titleAr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="report-details-textarea"
                  className="block text-xs sm:text-sm font-black"
                >
                  {t('approved_sources.report_details_label')}
                </label>
                <textarea
                  id="report-details-textarea"
                  rows={4}
                  value={reportText}
                  onChange={(e) => setReportText(e.target.value)}
                  placeholder={t('approved_sources.report_placeholder')}
                  className="w-full p-3.5 rounded-xl text-sm font-semibold outline-none resize-none"
                  style={{
                    backgroundColor: isBlackTheme ? '#272732' : '#f8fafc',
                    color: isBlackTheme ? '#FFFFFF' : '#0f172a',
                    border: `1px solid ${subtleBorderColor}`,
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={handleCopyReport}
                  className="min-h-[48px] px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
                  style={{
                    backgroundColor: isBlackTheme ? '#272732' : '#f1f5f9',
                    color: isBlackTheme ? '#FFFFFF' : '#0f172a',
                    border: `1px solid ${subtleBorderColor}`,
                  }}
                >
                  {copiedFeedback ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                  <span>{t('approved_sources.report_copy_btn')}</span>
                </button>

                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsReportOpen(false)}
                    className="min-h-[48px] px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all active:scale-95 no-underline"
                    style={{
                      backgroundColor: themeAccentColor,
                      color: isBlackTheme ? '#000000' : '#FFFFFF',
                    }}
                  >
                    <Send size={17} />
                    <span>{t('approved_sources.report_whatsapp_btn')}</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      showGlobalAppToast(t('approved_sources.report_empty_error'))
                    }
                    className="min-h-[48px] px-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 opacity-60 cursor-pointer"
                    style={{
                      backgroundColor: themeAccentColor,
                      color: isBlackTheme ? '#000000' : '#FFFFFF',
                    }}
                  >
                    <Send size={17} />
                    <span>{t('approved_sources.report_whatsapp_btn')}</span>
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ApprovedSourcesModal;
