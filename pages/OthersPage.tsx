import React, { useState, useEffect, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { markPageAsSeen } from '../utils/badgeManager';
import { useLanguage } from '../context/LanguageContext';
import { RUQYAH_DATA, RUQYAH_GUIDE_STEPS, RuqyahItem } from '../data/ruqyahData';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { RUQYAH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import ZoomModal from '../components/Ruqyah/ZoomModal';
import { scrollToNextCard } from '../utils/cardScrollHelper';
import { getToast3DStyles } from '../utils/toast3DStyles';
import QuranFormattedText, { getThemeQuranAccentColor } from '../components/Common/QuranFormattedText';

function hexToRgba(hex?: string, alpha: number = 1): string {
    if (!hex) return `rgba(46, 125, 94, ${alpha})`;
    let clean = hex.replace('#', '');
    if (clean.length === 3) {
        clean = clean.split('').map(c => c + c).join('');
    }
    const num = parseInt(clean, 16);
    if (isNaN(num)) return `rgba(46, 125, 94, ${alpha})`;
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface OthersPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  navParams?: any;
}

const OthersPage: React.FC<OthersPageProps> = ({ onBack, onNavigate, navParams }) => {
  const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
  const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
  const quranAccentColor = getThemeQuranAccentColor(theme, themeKey);
  const btnTextColor = isBlackTheme ? '#000000' : '#FFFFFF';
      
  const [activeTab, setActiveTab] = useState<'all' | 'quran' | 'sunnah' | 'favorites' | 'guide'>('all');
  const [activeTabMode, setActiveTabMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string>('');
  const [playingText, setPlayingText] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [zoomedDuaa, setZoomedDuaa] = useState<RuqyahItem | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuOpenDirection, setMenuOpenDirection] = useState<'up' | 'down'>('up');
  const [showGuide, setShowGuide] = useState(false);

  const fabRef = useRef<HTMLButtonElement>(null);
  const fabContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    markPageAsSeen('others');
    if (!getGuideSeen('ruqyah_page_spotlight')) {
      setShowGuide(true);
    }
  }, []);

  useEffect(() => {
    if (navParams?.highlightId || navParams?.itemId || navParams?.id) {
      const targetId = navParams.highlightId || navParams.itemId || navParams.id;
      setActiveTab('all');
      setZoomedDuaa(null);
      setTimeout(() => {
        const el = document.getElementById(`ruqyah-card-${targetId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2');
          }, 2500);
        }
      }, 150);
    }
  }, [navParams]);

  // Subscribe to TTS playing changes
  useEffect(() => {
    const unsubscribe = subscribeTTS(setPlayingText);
    return () => {
      unsubscribe();
      stopTTS();
    };
  }, []);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const savedFavorites = localStorage.getItem('ruqyah_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
    } catch (e) {
      console.error("Failed to load favorites", e);
    }
  }, []);

  // Save favorites to storage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      try {
        localStorage.setItem('ruqyah_favorites', JSON.stringify(newFavs));
      } catch (err) {}
      return newFavs;
    });
  };

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Clipboard Copier
  const copyToClipboard = async (text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      showToast(isEn ? 'Copied to clipboard successfully' : 'تم النسخ إلى الحافظة بنجاح');
    } catch (err) {
      showToast(isEn ? 'Failed to copy text' : 'فشل في نسخ النص');
    }
  };

  // Share Helper
  const handleShare = async (item: RuqyahItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareText = isEn ? (item.textEn || item.text) : item.text;
    const shareSource = isEn ? (item.sourceEn || item.source) : item.source;
    const shareCategory = isEn 
      ? (item.type === 'quran' ? 'The Noble Qur\'an' : 'Prophetic Sunnah') 
      : (item.type === 'quran' ? 'القرآن الكريم' : 'السنة النبوية');
    const shareTitle = isEn 
      ? (item.titleEn || item.sourceEn || 'Al-Ruqyah') 
      : (item.title || item.source || 'الرقية الشرعية');

    await shareAsImage({
      text: shareText,
      source: shareSource,
      category: shareCategory,
      title: shareTitle,
      theme,
      isEn,
      language: isEn ? 'en' : 'ar',
      setToastMessage
    });
  };

  // Play/Stop Audio TTS Handler
  const handlePlayAudio = (item: RuqyahItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const textToPlay = isEn ? (item.textEn || item.text) : item.text;
    if (playingText === textToPlay) {
      stopTTS();
      setPlayingText(null);
    } else {
      playTTS(textToPlay, {
        isEn,
        lang: isEn ? 'en' : 'ar',
        onToast: (msg) => {
          showToast(msg);
        }
      });
    }
  };

  // FAB direction decider on click
  const handleFabClick = () => {
    if (!isMenuOpen && fabRef.current) {
      const rect = fabRef.current.getBoundingClientRect();
      if (rect.top < window.innerHeight / 2) {
        setMenuOpenDirection('down');
      } else {
        setMenuOpenDirection('up');
      }
    }
    setIsMenuOpen(!isMenuOpen);
  };

  // Tab switch
  const switchTab = (newTab: 'all' | 'quran' | 'sunnah' | 'favorites' | 'guide') => {
    setIsMenuOpen(false);
    if (newTab === activeTab) return;
    setActiveTab(newTab);
  };

  // Back interceptor for hardware/device back button
  useEffect(() => {
    const interceptor = () => {
      // 1. Close spotlight guide if open
      if (showGuide) {
        setShowGuide(false);
        return true;
      }
      // 2. Close zoom modal if open
      if (zoomedDuaa) {
        setZoomedDuaa(null);
        return true;
      }
      // 3. Close floating quick-menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
        return true;
      }
      return false;
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [zoomedDuaa, isMenuOpen, showGuide]);

  // Filters items dynamically based on tab state
  const getFilteredItems = () => {
    if (activeTab === 'all') return RUQYAH_DATA;
    if (activeTab === 'favorites') return RUQYAH_DATA.filter(item => favorites.includes(item.id));
    if (activeTab === 'quran') return RUQYAH_DATA.filter(item => item.type === 'quran');
    if (activeTab === 'sunnah') return RUQYAH_DATA.filter(item => item.type === 'sunnah');
    return [];
  };

  const filteredItems = getFilteredItems().filter(item => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const text = (item.text || '').toLowerCase();
    const textEn = (item.textEn || '').toLowerCase();
    const source = (item.source || '').toLowerCase();
    const sourceEn = (item.sourceEn || '').toLowerCase();
    const title = (item.title || '').toLowerCase();
    const titleEn = (item.titleEn || '').toLowerCase();
    return text.includes(q) || textEn.includes(q) || source.includes(q) || sourceEn.includes(q) || title.includes(q) || titleEn.includes(q);
  });

  return (
    <div 
      className="h-[100dvh] w-full flex flex-col overflow-hidden relative transition-colors" 
      style={{ 
        fontFamily: isEn ? 'inherit' : "'Cairo', sans-serif",
        backgroundColor: isBlackTheme ? '#000000' : (theme.bgColor || (theme.isDark ? '#0F172A' : '#F5F7FA')) 
      }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Top Header */}
      <header id="ruqyah-header" className="app-top-bar z-20 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
        <div className="app-top-bar__inner">
          <div className="relative flex items-center justify-center w-full min-h-[44px]">
            {/* Back Button */}
            <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
              <button
                onClick={onBack}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                title={isEn ? "Back" : "رجوع للخلف"}
                aria-label={isEn ? "Back" : "رجوع للخلف"}
              >
                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
              </button>
            </div>

            {/* Page Title */}
            <div className="text-center px-12 min-w-0">
              <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                {isEn ? "Al-Ruqyah Al-Shar'iyyah" : "الرقية الشرعية"}
              </h1>
            </div>

            {/* Guide Icon, Theme Lock and Home Icon */}
            <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                style={{ color: 'var(--top-bar-text, inherit)' }}
                title={isEn ? "Ruqyah Guide" : "دليل وشرح الرقية الشرعية"}
                aria-label={isEn ? "Ruqyah Guide" : "دليل وشرح الرقية الشرعية"}
              >
                <i className="fa-solid fa-circle-question text-lg"></i>
              </button>
              <button
                type="button"
                onClick={() => onNavigate('home')}
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

      {/* Main Container */}
      <main className="w-full flex-1 min-h-0 overflow-y-auto px-4 pt-3 app-scroll-safe-fab">
        {/* Modern Borderless Search and View Mode Control */}
        <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
          <div className={`app-page-card border-0 relative flex-1 rounded-2xl ${isBlackTheme ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} transition-all focus-within:ring-2 focus-within:ring-opacity-40 flex items-center overflow-visible`}
               style={{ 
                 '--tw-ring-color': primaryColor,
               } as any}
          >
            <span
              className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
              style={{
                backgroundColor: isBlackTheme ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(primaryColor, 0.12),
                color: isBlackTheme ? '#FFFFFF' : primaryColor,
              }}
              aria-hidden="true"
            >
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input 
              type="text" 
              placeholder={isEn ? "Search Ruqyah..." : "ابحث في الرقية الشرعية..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${
                isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'
              } placeholder-gray-400 dark:placeholder-gray-500`}
              style={{ color: 'var(--text-color)' }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className={`app-page-card unified-3d-btn border-0 absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer`}
              >
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            )}
          </div>
        </div>

        <div 
          className={`${activeTabMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} max-w-3xl mx-auto gap-4 pt-1 ${isEn ? 'text-left' : 'text-right'}`}
          dir={isEn ? 'ltr' : 'rtl'}
        >
            {/* TABS: QURANIC / SUNNAH / FAVORITES / ALL LISTS */}
            {activeTab !== 'guide' && (
              <React.Fragment>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const currentItemText = isEn ? (item.textEn || item.text) : item.text;
                    const isCurrentlyPlaying = playingText === currentItemText;

                    return (
                      <div 
                        id={`ruqyah-card-${item.id}`}
                        key={item.id} 
                        data-card-item="true"
                        className="app-page-card tasbeeh-pressable border-0 p-5 pb-4 rounded-2xl bg-white dark:bg-[#1E293B] relative transition-all duration-300 overflow-visible group flex flex-col justify-between cursor-pointer" 
                        onClick={(e) => {
                          const cardEl = e.currentTarget as HTMLElement;
                          setTimeout(() => scrollToNextCard(cardEl), 60);
                        }}
                        style={{ 
                          fontFamily: isEn ? 'inherit' : "'Cairo', sans-serif",
                          color: 'var(--text-color)',
                        }}
                      >
                        {/* Text: generous line-height to prevent tashkeel overlap */}
                        <QuranFormattedText
                          text={currentItemText}
                          source={isEn ? (item.sourceEn || item.source) : item.source}
                          title={isEn ? (item.titleEn || item.title) : item.title}
                          isEn={isEn}
                          isQuran={item.type === 'quran'}
                          accentColor={quranAccentColor}
                          className={`mb-4 ${
                            isEn ? 'text-base md:text-lg font-medium leading-relaxed' : 'text-lg font-medium font-cairo leading-loose'
                          }`}
                          nonQuranClassName={`text-center mb-4 select-none text-balance ${
                            isEn ? 'text-base md:text-lg font-medium leading-relaxed' : 'text-lg font-medium font-cairo leading-loose'
                          }`}
                          style={{ color: 'var(--text-color)' }}
                        />
                        
                        {/* Action buttons bar */}
                        <div className="flex justify-between items-center mt-auto pt-3 pb-1 border-t border-slate-100/90 dark:border-white/5 overflow-visible">
                          {/* Favorite Button */}
                          <button 
                            onClick={(e) => toggleFavorite(item.id, e)} 
                            className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all shrink-0 cursor-pointer"
                            title={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                            aria-label={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                          >
                            <i 
                              className={`fa-heart ${favorites.includes(item.id) ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} 
                              style={favorites.includes(item.id) ? {} : { color: 'var(--text-color)' }}
                            ></i>
                          </button>

                          {/* Control buttons group (Zoom, Copy, Share, Audio) */}
                          <div className="flex gap-2.5 overflow-visible">
                            {/* Zoom Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedDuaa(item);
                              }} 
                              className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all shrink-0 cursor-pointer"
                              style={{ color: 'var(--text-color)' }}
                              title={isEn ? "Zoom" : "تكبير"}
                              aria-label={isEn ? "Zoom" : "تكبير"}
                            >
                              <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                            </button>

                            {/* Copy Button */}
                            <button 
                              onClick={(e) => copyToClipboard(currentItemText, e)} 
                              className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all shrink-0 cursor-pointer" 
                              style={{ color: 'var(--text-color)' }}
                              title={isEn ? "Copy" : "نسخ"}
                              aria-label={isEn ? "Copy" : "نسخ"}
                            >
                              <i className="fa-regular fa-copy text-xs"></i>
                            </button>

                            {/* Share Button */}
                            <button 
                              onClick={(e) => handleShare(item, e)} 
                              className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all shrink-0 cursor-pointer" 
                              style={{ color: 'var(--text-color)' }}
                              title={isEn ? "Share" : "مشاركة"}
                              aria-label={isEn ? "Share" : "مشاركة"}
                            >
                              <i className="fa-solid fa-share-nodes text-xs"></i>
                            </button>

                            {/* Audio Play/Pause Button */}
                            <button 
                              onClick={(e) => handlePlayAudio(item, e)} 
                              className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all shrink-0 cursor-pointer" 
                              style={{ color: isCurrentlyPlaying ? '#ef4444' : 'var(--text-color)' }}
                              title={isCurrentlyPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Listen" : "استماع صوتي")}
                              aria-label={isCurrentlyPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Listen" : "استماع صوتي")}
                            >
                              <i className={`fa-solid ${isCurrentlyPlaying ? 'fa-circle-pause text-red-500 animate-pulse text-sm' : 'fa-volume-high text-xs'}`}></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center opacity-60 font-bold rounded-2xl col-span-full">
                    <p>{isEn ? "No items saved to favorites yet." : "لا يوجد عناصر محفوظة في المفضلة حالياً."}</p>
                  </div>
                )}
              </React.Fragment>
            )}

            {/* TAB 3: RUQYAH SELF GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4 col-span-full" dir={isEn ? 'ltr' : 'rtl'}>
                <div 
                  className="app-page-card border-0 p-6 rounded-2xl bg-white dark:bg-[#1E293B] space-y-4 overflow-visible"
                  style={{
                    color: 'var(--text-color)',
                  }}
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                    <i className="fa-solid fa-shield-halved text-lg" style={{ color: primaryColor }}></i>
                    <h3 className="text-base font-black font-kufi" style={{ color: primaryColor }}>
                      {isEn ? "Ruqyah Guide (How to perform Ruqyah on yourself & family?)" : "دليل الرقية (كيف ترقي نفسك وأهلك؟)"}
                    </h3>
                  </div>

                  <div className="space-y-3.5 pb-1 text-xs sm:text-sm leading-relaxed font-bold overflow-visible">
                    {RUQYAH_GUIDE_STEPS.map((step) => (
                      <div key={step.number} className="app-page-card border-0 p-3.5 rounded-2xl bg-white dark:bg-[#1E293B] flex gap-3 items-start">
                        <div 
                          className="app-page-card border-0 w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono transition-colors"
                          style={{ 
                            backgroundColor: primaryColor, 
                            color: btnTextColor 
                          }}
                        >
                          {isEn ? step.number : ['١', '٢', '٣', '٤', '٥'][step.number - 1]}
                        </div>
                        <div>
                          <span 
                            className="font-bold block mb-0.5 transition-colors"
                            style={{ color: primaryColor }}
                          >
                            {isEn ? step.titleEn : step.titleAr}
                          </span>
                          <p className="opacity-80 font-normal">
                            {isEn ? step.descEn : step.descAr}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div 
          className="app-3d-toast fixed left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
          style={{
            bottom: 'calc(var(--app-safe-bottom) + 1.25rem)',
            ...toast3D.style,
          }}
        >
          <span
            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={toast3D.iconStyle}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Backdrop to close floating menu when clicking anywhere */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[1200] bg-transparent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Floating Action Button (FAB) & Menu */}
      <div 
        ref={fabContainerRef} 
        className={`fixed app-fab-bottom ${isEn ? 'left-5 items-start' : 'right-5 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
      >
        {isMenuOpen && (
          <div
            className={`app-page-card border-0 absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} bg-white dark:bg-[#1E293B] rounded-2xl p-2.5 pb-3 flex flex-col gap-2 overflow-visible w-48 z-0`}
            style={{ color: 'var(--text-color)' }}
            onClick={(e) => e.stopPropagation()}
            dir={isEn ? 'ltr' : 'rtl'}
          >
              <button 
                onClick={() => switchTab('all')}
                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer"
                style={activeTab === 'all' ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor 
                } : undefined}
              >
                {isEn ? "All" : "الكل"}
              </button>
              <button 
                onClick={() => switchTab('favorites')}
                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-sm font-bold transition-all cursor-pointer"
                style={activeTab === 'favorites' ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor 
                } : undefined}
              >
                {isEn ? "Favorites" : "المفضلة"}
              </button>
              <div className="app-3d-divider my-1 mx-1" />
              
              <button 
                onClick={() => switchTab('quran')}
                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold transition-all cursor-pointer"
                style={activeTab === 'quran' ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor 
                } : undefined}
              >
                {isEn ? "The Noble Qur'an" : "القرآن الكريم"}
              </button>

              <button 
                onClick={() => switchTab('sunnah')}
                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold transition-all cursor-pointer"
                style={activeTab === 'sunnah' ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor 
                } : undefined}
              >
                {isEn ? "Prophetic Sunnah" : "السنة النبوية"}
              </button>

              <button 
                onClick={() => switchTab('guide')}
                className="app-page-card border-0 w-full text-start px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1E293B] text-xs font-bold transition-all cursor-pointer"
                style={activeTab === 'guide' ? { 
                  backgroundColor: primaryColor, 
                  color: btnTextColor 
                } : undefined}
              >
                {isEn ? "Ruqyah Guide" : "دليل الرقية"}
              </button>
          </div>
        )}

        {/* 3D FAB matching Tasbeeh */}
        <button 
          ref={fabRef}
          onClick={handleFabClick}
          className="app-page-card border-0 w-14 h-14 rounded-full flex items-center justify-center transition-all cursor-pointer relative z-10"
          style={{
            backgroundColor: primaryColor,
            color: btnTextColor,
          }}
          title={isEn ? "Sections & Categories" : "الأقسام والتصنيفات"}
          aria-label={isEn ? "Sections & Categories" : "الأقسام والتصنيفات"}
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
        </button>
      </div>

      {/* Zoom Modal */}
      <ZoomModal 
        zoomedDuaa={zoomedDuaa} 
        onClose={() => setZoomedDuaa(null)} 
        setToastMessage={setToastMessage} 
      />

      {/* Ruqyah Page Spotlight Guide */}
      <CommunitySpotlightGuide
        guideKey="ruqyah_page_spotlight"
        steps={RUQYAH_PAGE_STEPS}
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        isEn={isEn}
      />
    </div>
  );
};

export default OthersPage;
