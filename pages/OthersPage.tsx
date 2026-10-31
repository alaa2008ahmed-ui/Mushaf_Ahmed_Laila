import React, { useState, useEffect, useRef } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, ListFilter, HelpCircle } from 'lucide-react';
import ThemePageLock from '../components/ThemePageLock';
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
  onOpenThemes?: () => void;
  navParams?: any;
}

const OthersPage: React.FC<OthersPageProps> = ({ onBack, onNavigate, onOpenThemes, navParams }) => {
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isBlackTheme = theme.bgColor === '#000000' || themeKey === 'deep_black' || theme.name === 'اسود' || theme.name === 'أبيض وأسود';
  const primaryColor = isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || theme.accent || '#2E7D5E');
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
    if (navParams?.highlightId || navParams?.itemId) {
      const targetId = navParams.highlightId || navParams.itemId;
      const found = RUQYAH_DATA.find(i => i.id === targetId);
      if (found) {
        setZoomedDuaa(found);
      }
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
      className="h-screen w-full flex flex-col overflow-hidden relative transition-colors" 
      style={{ 
        fontFamily: isEn ? 'inherit' : theme.font,
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
              <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
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
              <ThemePageLock />
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
      <main className="w-full flex-1 overflow-y-auto px-4 pt-3 pb-6">
        {/* Modern Borderless Search and View Mode Control */}
        <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
          <div className="relative flex-1 rounded-2xl transition-all focus-within:ring-2 focus-within:ring-opacity-40 flex items-center overflow-hidden"
               style={{ 
                 '--tw-ring-color': primaryColor,
                 backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? 'rgba(39, 39, 42, 0.7)' : '#FFFFFF'),
                 boxShadow: theme.isDark ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)'
               } as any}
          >
            <i 
              className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-45 pointer-events-none text-sm`} 
              style={{ color: 'var(--text-color)' }}
            ></i>
            <input 
              type="text" 
              placeholder={isEn ? "Search Ruqyah..." : "ابحث في الرقية الشرعية..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${
                isEn ? 'pl-11 pr-10 text-left font-sans' : 'pr-11 pl-10 text-right font-kufi'
              } placeholder-gray-400 dark:placeholder-gray-500`}
              style={{ color: 'var(--text-color)' }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer`}
              >
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            )}
          </div>

          {/* View Mode Switch Chips */}
          <div 
            className="flex items-center p-1 rounded-2xl shrink-0 gap-1"
            style={{
              backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? 'rgba(39, 39, 42, 0.7)' : '#FFFFFF'),
              boxShadow: theme.isDark ? 'none' : '0 4px 14px rgba(0, 0, 0, 0.04)'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTabMode('grid')}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                activeTabMode === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              style={activeTabMode === 'grid' ? {
                backgroundColor: primaryColor,
                color: btnTextColor
              } : { color: 'var(--text-color)' }}
              title={isEn ? "Grid View" : "عرض شبكي"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('list')}
              className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all cursor-pointer ${
                activeTabMode === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'
              }`}
              style={activeTabMode === 'list' ? {
                backgroundColor: primaryColor,
                color: btnTextColor
              } : { color: 'var(--text-color)' }}
              title={isEn ? "List View" : "عرض القوائم"}
            >
              <ListFilter size={16} />
            </button>
          </div>
        </div>

        <div 
          className={`${activeTabMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} max-w-3xl mx-auto gap-4 pt-1 pb-6 ${isEn ? 'text-left' : 'text-right'}`}
          dir={isEn ? 'ltr' : 'rtl'}
        >
          <AnimatePresence mode="wait">
            {/* TABS: QURANIC / SUNNAH / FAVORITES / ALL LISTS */}
            {activeTab !== 'guide' && (
              <React.Fragment>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const currentItemText = isEn ? (item.textEn || item.text) : item.text;
                    const isCurrentlyPlaying = playingText === currentItemText;

                    return (
                      <div 
                        key={item.id} 
                        data-card-item="true"
                        className="p-5 pb-3 rounded-[18px] relative transition-all duration-300 overflow-hidden group shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_6px_25px_rgba(0,0,0,0.06)] border border-slate-100/80 dark:border-white/5 flex flex-col justify-between cursor-pointer" 
                        onClick={(e) => {
                          const cardEl = e.currentTarget as HTMLElement;
                          setTimeout(() => scrollToNextCard(cardEl), 60);
                        }}
                        style={{ 
                          fontFamily: isEn ? 'inherit' : theme.font,
                          backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? (theme.cardBg || '#18181B') : '#FFFFFF'),
                          color: 'var(--text-color)'
                        }}
                      >
                        {/* Text: generous line-height to prevent tashkeel overlap */}
                        <p 
                          className={`text-center mb-4 select-none text-balance ${
                            isEn ? 'text-base md:text-lg font-medium leading-relaxed' : 'text-xl md:text-2xl font-amiri leading-[2.3]'
                          }`} 
                          style={{ color: 'var(--text-color)' }}
                        >
                          {currentItemText}
                        </p>

                        {/* Metadata Pill */}
                        <div className="flex justify-center mb-3">
                          <span 
                            className="text-xs sm:text-sm text-center opacity-70 font-bold bg-slate-100 dark:bg-zinc-800/60 px-3.5 py-1 rounded-full" 
                            style={{ color: 'var(--text-color)' }}
                          >
                            {item.type === 'quran' 
                              ? (isEn ? (item.sourceEn || item.source) : item.source)
                              : (isEn ? `Prophetic Sunnah • ${item.sourceEn || item.source}` : `السنة النبوية • ${item.source}`)}
                          </span>
                        </div>
                        
                        {/* Action buttons bar */}
                        <div className="flex justify-between items-center mt-auto pt-3 border-t border-slate-100/90 dark:border-white/5">
                          {/* Favorite Button */}
                          <button 
                            onClick={(e) => toggleFavorite(item.id, e)} 
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors shrink-0 cursor-pointer"
                            title={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                            aria-label={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                          >
                            <i 
                              className={`fa-heart ${favorites.includes(item.id) ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} 
                              style={favorites.includes(item.id) ? {} : { color: 'var(--text-color)' }}
                            ></i>
                          </button>

                          {/* Control buttons group (Zoom, Copy, Share, Audio) */}
                          <div className="flex gap-2">
                            {/* Zoom Button */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setZoomedDuaa(item);
                              }} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer"
                              style={{ color: 'var(--text-color)' }}
                              title={isEn ? "Zoom" : "تكبير"}
                              aria-label={isEn ? "Zoom" : "تكبير"}
                            >
                              <i className="fa-solid fa-magnifying-glass-plus text-xs"></i>
                            </button>

                            {/* Copy Button */}
                            <button 
                              onClick={(e) => copyToClipboard(currentItemText, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                              style={{ color: 'var(--text-color)' }} 
                              title={isEn ? "Copy" : "نسخ"}
                              aria-label={isEn ? "Copy" : "نسخ"}
                            >
                              <i className="fa-regular fa-copy text-xs"></i>
                            </button>

                            {/* Share Button */}
                            <button 
                              onClick={(e) => handleShare(item, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
                              style={{ color: 'var(--text-color)' }} 
                              title={isEn ? "Share" : "مشاركة"}
                              aria-label={isEn ? "Share" : "مشاركة"}
                            >
                              <i className="fa-solid fa-share-nodes text-xs"></i>
                            </button>

                            {/* Audio Play/Pause Button */}
                            <button 
                              onClick={(e) => handlePlayAudio(item, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100/80 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors opacity-75 hover:opacity-100 cursor-pointer" 
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
                  className="p-6 rounded-[18px] border border-slate-100/80 dark:border-white/5 space-y-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-none"
                  style={{
                    backgroundColor: isBlackTheme ? '#18181b' : (theme.isDark ? (theme.cardBg || '#18181B') : '#FFFFFF'),
                    color: 'var(--text-color)'
                  }}
                >
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                    <i className="fa-solid fa-shield-halved text-lg" style={{ color: primaryColor }}></i>
                    <h3 className="text-base font-black font-kufi" style={{ color: primaryColor }}>
                      {isEn ? "Ruqyah Guide (How to perform Ruqyah on yourself & family?)" : "دليل الرقية (كيف ترقي نفسك وأهلك؟)"}
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-bold">
                    {RUQYAH_GUIDE_STEPS.map((step) => (
                      <div key={step.number} className="flex gap-3">
                        <div 
                          className="w-7 h-7 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono shadow-sm transition-colors"
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
          </AnimatePresence>
          <div className="shrink-0 w-full h-28 col-span-full"></div>
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[200] bg-gray-900/90 backdrop-blur text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm text-center whitespace-nowrap border border-white/10"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

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
        className={`fixed ${isEn ? 'left-5 items-start' : 'right-5 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 24px) + 32px)' }}
      >
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-3' : 'top-full mt-3'} bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-2 flex flex-col gap-1 overflow-hidden w-48 z-0 border border-slate-100/80 dark:border-white/10`}
              style={{ color: 'var(--text-color)' }}
              onClick={(e) => e.stopPropagation()}
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <button 
                onClick={() => switchTab('all')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                style={activeTab === 'all' ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor 
                } : {}}
              >
                {isEn ? "All" : "الكل"}
              </button>
              <button 
                onClick={() => switchTab('favorites')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
                style={activeTab === 'favorites' ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor 
                } : {}}
              >
                {isEn ? "Favorites" : "المفضلة"}
              </button>
              <div className="h-px bg-slate-100 dark:bg-white/10 my-1" />
              
              <button 
                onClick={() => switchTab('quran')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={activeTab === 'quran' ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor 
                } : {}}
              >
                {isEn ? "The Noble Qur'an" : "القرآن الكريم"}
              </button>

              <button 
                onClick={() => switchTab('sunnah')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={activeTab === 'sunnah' ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor 
                } : {}}
              >
                {isEn ? "Prophetic Sunnah" : "السنة النبوية"}
              </button>

              <button 
                onClick={() => switchTab('guide')}
                className="w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                style={activeTab === 'guide' ? { 
                  backgroundColor: hexToRgba(primaryColor, 0.12), 
                  color: primaryColor 
                } : {}}
              >
                {isEn ? "Ruqyah Guide" : "دليل الرقية"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modern Flat FAB */}
        <button 
          ref={fabRef}
          onClick={handleFabClick}
          className="w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 border-0"
          style={{
            backgroundColor: primaryColor,
            color: btnTextColor,
            boxShadow: `0 8px 25px ${hexToRgba(primaryColor, isBlackTheme ? 0.2 : 0.35)}`
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
