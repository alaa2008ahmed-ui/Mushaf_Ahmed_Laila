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

interface OthersPageProps {
  onBack: () => void;
  onNavigate: (pageId: string, params?: any) => void;
  onOpenThemes?: () => void;
}

const OthersPage: React.FC<OthersPageProps> = ({ onBack, onNavigate, onOpenThemes }) => {
  const { theme, themeKey } = useTheme();
  const { language } = useLanguage();
  const isEn = language === 'en';

  const isBlackTheme = theme.bgColor === '#000000';
  const isDefaultTheme = themeKey === 'default' || theme.name === 'الافتراضي' || !!theme.isOriginal || !themeKey;
  const cardBorderColor = isBlackTheme ? '#222222' : (theme.isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)');
      
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
      return false; // Let global handler navigate back
    };
    const unregister = registerBackInterceptor(interceptor);
    return unregister;
  }, [zoomedDuaa, isMenuOpen, showGuide]);

  const getCardStyle = () => {
    return {
      borderColor: cardBorderColor,
      borderWidth: '1.5px',
      borderStyle: 'solid',
      backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.8)',
    };
  };

  const getTabStyle = (active: boolean) => {
    if (active) {
      if (isBlackTheme) {
        return {
          backgroundColor: '#FFFFFF',
          color: '#000000',
          borderColor: '#FFFFFF'
        };
      }
      const isWhiteBg = 
        theme.palette[0]?.toLowerCase() === '#ffffff' || 
        theme.palette[0]?.toLowerCase() === 'white' || 
        theme.palette[0]?.toLowerCase() === '#fff';

      return {
        backgroundColor: theme.palette[0],
        color: isWhiteBg ? '#000000' : '#ffffff',
        borderColor: theme.palette[0]
      };
    }
    return {
      backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.5)',
      color: theme.textColor,
      borderColor: isBlackTheme ? 'rgba(255, 255, 255, 0.2)' : theme.palette[0] + '33'
    };
  };

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
      className="h-screen w-full flex flex-col overflow-hidden relative bg-transparent" 
      style={{ fontFamily: isEn ? 'inherit' : theme.font }}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      {/* Top Header with Back Button, Guide, Theme Lock, and Home Button */}
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
                <HelpCircle size={19} />
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
      <main className="w-full flex-1 overflow-y-auto px-4 pt-2 pb-4">
        {/* Search and View Mode Control - Identical to Adia */}
        <div className="mb-6 max-w-3xl mx-auto flex items-center gap-2 w-full" dir={isEn ? 'ltr' : 'rtl'}>
          <div 
            className="relative flex-1 border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
            style={{ borderColor: cardBorderColor, ...(isDefaultTheme ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
          >
            <input 
              type="text" 
              placeholder={isEn ? "Search Ruqyah..." : "ابحث في الرقية الشرعية..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full bg-black/5 dark:bg-white/5 py-3 ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} focus:outline-none placeholder-gray-500 dark:placeholder-gray-400`}
              style={{ color: 'var(--text-color)' }}
            />
            <i 
              className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-50`} 
              style={{ color: 'var(--text-color)' }}
            ></i>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600`}
              >
                <i className="fa-solid fa-times text-xs"></i>
              </button>
            )}
          </div>

          {/* View Mode Switch - Matches Adia page and adapts to every theme */}
          <div 
            className="flex items-center p-1 rounded-2xl border shrink-0 shadow-sm"
            style={{
              backgroundColor: isBlackTheme ? '#111111' : (theme.isDark ? '#1e293b' : '#ffffff'),
              borderColor: cardBorderColor
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTabMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabMode === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
              style={activeTabMode === 'grid' ? {
                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                color: isBlackTheme ? '#000000' : '#ffffff'
              } : { color: 'var(--text-color)' }}
              title={isEn ? "Grid View" : "عرض شبكي"}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              onClick={() => setActiveTabMode('list')}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabMode === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
              style={activeTabMode === 'list' ? {
                backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                color: isBlackTheme ? '#000000' : '#ffffff'
              } : { color: 'var(--text-color)' }}
              title={isEn ? "List View" : "عرض القوائم"}
            >
              <ListFilter size={16} />
            </button>
          </div>
        </div>

        <div 
          className={`${activeTabMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'} max-w-3xl mx-auto gap-4 pt-2 pb-6 ${isEn ? 'text-left' : 'text-right'}`}
          dir={isEn ? 'ltr' : 'rtl'}
        >
          <AnimatePresence mode="wait">
            {/* TABS 1 & 2: QURANIC / SUNNAH / FAVORITES / ALL LISTS */}
            {activeTab !== 'guide' && (
              <React.Fragment>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const currentItemText = isEn ? (item.textEn || item.text) : item.text;
                    const isCurrentlyPlaying = playingText === currentItemText;

                    return (
                      <div 
                        key={item.id} 
                        className="p-5 rounded-3xl relative transition-all overflow-hidden themed-card group shadow-sm border flex flex-col justify-between" 
                        style={{ 
                          fontFamily: isEn ? 'inherit' : theme.font,
                          borderColor: cardBorderColor,
                          borderWidth: '1.5px',
                          borderStyle: 'solid'
                        }}
                      >
                        {/* Text (Centered, Clear Typography) */}
                        <p 
                          className={`leading-relaxed text-center mb-6 ${isEn ? 'text-base md:text-lg font-medium' : 'text-xl md:text-2xl font-amiri'}`} 
                          style={{ color: 'var(--text-color)' }}
                        >
                          {currentItemText}
                        </p>

                        {/* Meta & Interactive Control Line */}
                        <div className="mt-auto pt-4 border-t space-y-4" style={{ borderColor: 'var(--card-border)' }}>
                          {/* Metadata Pill showing Surah and Ayah numbers for Quran, or Hadith source for Sunnah */}
                          <div className="flex justify-center">
                            <span 
                              className="text-xs sm:text-sm text-center opacity-75 font-bold bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full" 
                              style={{ color: 'var(--text-color)' }}
                            >
                              {item.type === 'quran' 
                                ? (isEn ? (item.sourceEn || item.source) : item.source)
                                : (isEn ? `Prophetic Sunnah • ${item.sourceEn || item.source}` : `السنة النبوية • ${item.source}`)}
                            </span>
                          </div>
                          
                          {/* Action buttons bar */}
                          <div className={`flex justify-between items-center ${isEn ? 'flex-row' : 'flex-row-reverse'}`}>
                            {/* Control buttons group (Zoom, Copy, Share, Audio) */}
                            <div className="flex gap-2">
                              {/* Zoom Button */}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setZoomedDuaa(item);
                                }} 
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer"
                                style={{ color: 'var(--text-color)' }}
                                title={isEn ? "Zoom" : "تكبير"}
                                aria-label={isEn ? "Zoom" : "تكبير"}
                              >
                                <i className="fa-solid fa-magnifying-glass-plus"></i>
                              </button>

                              {/* Copy Button */}
                              <button 
                                onClick={(e) => copyToClipboard(currentItemText, e)} 
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer" 
                                style={{ color: 'var(--text-color)' }} 
                                title={isEn ? "Copy" : "نسخ"}
                                aria-label={isEn ? "Copy" : "نسخ"}
                              >
                                <i className="fa-regular fa-copy"></i>
                              </button>

                              {/* Share Button */}
                              <button 
                                onClick={(e) => handleShare(item, e)} 
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer" 
                                style={{ color: 'var(--text-color)' }} 
                                title={isEn ? "Share" : "مشاركة"}
                                aria-label={isEn ? "Share" : "مشاركة"}
                              >
                                <i className="fa-solid fa-share-nodes"></i>
                              </button>

                              {/* Audio Play/Pause Button */}
                              <button 
                                onClick={(e) => handlePlayAudio(item, e)} 
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors opacity-70 hover:opacity-100 cursor-pointer" 
                                style={{ color: isCurrentlyPlaying ? '#ef4444' : 'var(--text-color)' }}
                                title={isCurrentlyPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Listen" : "استماع صوتي")}
                                aria-label={isCurrentlyPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Listen" : "استماع صوتي")}
                              >
                                <i className={`fa-solid ${isCurrentlyPlaying ? 'fa-circle-pause text-red-500 animate-pulse' : 'fa-volume-high'}`}></i>
                              </button>
                            </div>

                            {/* Favorite Button */}
                            <button 
                              onClick={(e) => toggleFavorite(item.id, e)} 
                              className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors shrink-0 cursor-pointer"
                              title={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                              aria-label={isEn ? (favorites.includes(item.id) ? "Remove from Favorites" : "Add to Favorites") : (favorites.includes(item.id) ? "إزالة من المفضلة" : "إضافة للمفضلة")}
                            >
                              <i 
                                className={`fa-heart ${favorites.includes(item.id) ? 'fa-solid text-red-500' : 'fa-regular opacity-70'}`} 
                                style={favorites.includes(item.id) ? {} : { color: 'var(--text-color)' }}
                              ></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center opacity-60 font-bold border-2 border-dashed rounded-3xl col-span-full" style={{ borderColor: 'var(--card-border)' }}>
                    <p>{isEn ? "No items saved to favorites yet." : "لا يوجد عناصر محفوظة في المفضلة حالياً."}</p>
                  </div>
                )}
              </React.Fragment>
            )}

            {/* TAB 3: RUQYAH SELF GUIDE */}
            {activeTab === 'guide' && (
              <div className="space-y-4 col-span-full" dir={isEn ? 'ltr' : 'rtl'}>
                <div 
                  className="p-5 rounded-2xl border-2 space-y-4"
                  style={getCardStyle()}
                >
                  <div className="flex items-center gap-2 border-b pb-2">
                    <i className="fa-solid fa-shield-halved text-lg" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}></i>
                    <h3 className="text-base font-black font-kufi" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                      {isEn ? "Ruqyah Guide (How to perform Ruqyah on yourself & family?)" : "دليل الرقية (كيف ترقي نفسك وأهلك؟)"}
                    </h3>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed font-bold">
                    {RUQYAH_GUIDE_STEPS.map((step) => (
                      <div key={step.number} className="flex gap-3">
                        <div 
                          className="w-6 h-6 rounded-full font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono shadow-sm transition-colors"
                          style={{ 
                            backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0], 
                            color: isBlackTheme ? '#000000' : '#FFFFFF' 
                          }}
                        >
                          {isEn ? step.number : ['١', '٢', '٣', '٤', '٥'][step.number - 1]}
                        </div>
                        <div>
                          <span 
                            className="font-bold block mb-0.5 transition-colors"
                            style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}
                          >
                            {isEn ? step.titleEn : step.titleAr}
                          </span>
                          <p className="opacity-90 font-normal">
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
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop to close floating menu when clicking anywhere */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-[1200] bg-transparent cursor-pointer"
          style={{ position: 'fixed' }}
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(false);
          }}
        />
      )}

      {/* Floating Action Button (FAB) & Menu */}
      <div 
        ref={fabContainerRef} 
        className={`fixed bottom-3 ${isEn ? 'left-4 items-start' : 'right-4 items-end'} ${isMenuOpen ? 'z-[1250]' : 'z-[90]'} flex flex-col`}
      >
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: menuOpenDirection === 'up' ? 20 : -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className={`absolute ${isEn ? 'left-0 origin-bottom-left' : 'right-0 origin-bottom-right'} ${menuOpenDirection === 'up' ? 'bottom-full mb-4' : 'top-full mt-4'} themed-card rounded-2xl shadow-xl border p-2 flex flex-col gap-1 overflow-hidden w-48 z-0`}
              style={{ 
                borderColor: 'var(--card-border)', 
                color: 'var(--text-color)',
                backgroundColor: theme.cardBg || 'rgba(255, 255, 255, 0.95)'
              }}
              onClick={(e) => e.stopPropagation()}
              dir={isEn ? 'ltr' : 'rtl'}
            >
              <button 
                onClick={() => switchTab('all')}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'all' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'all' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                {isEn ? "All" : "الكل"}
              </button>
              <button 
                onClick={() => switchTab('favorites')}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${activeTab === 'favorites' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'favorites' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                {isEn ? "Favorites" : "المفضلة"}
              </button>
              <div className="h-px bg-black/10 dark:bg-white/10 my-1" />
              
              <button 
                onClick={() => switchTab('quran')}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'quran' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'quran' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                {isEn ? "The Noble Qur'an" : "القرآن الكريم"}
              </button>

              <button 
                onClick={() => switchTab('sunnah')}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'sunnah' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'sunnah' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                {isEn ? "Prophetic Sunnah" : "السنة النبوية"}
              </button>

              <button 
                onClick={() => switchTab('guide')}
                className={`w-full ${isEn ? 'text-left' : 'text-right'} px-4 py-2.5 rounded-xl text-xs font-bold transition-colors ${activeTab === 'guide' ? 'bg-black/5 dark:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                style={activeTab === 'guide' ? { color: isBlackTheme ? '#FFFFFF' : theme.palette[0] } : {}}
              >
                {isEn ? "Ruqyah Guide" : "دليل الرقية"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <button 
          ref={fabRef}
          onClick={handleFabClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer relative z-10 ${themeKey === 'default' ? 'text-black' : (isBlackTheme ? 'text-black' : 'text-white')}`}
          style={
            themeKey === 'default'
            ? { backgroundColor: '#ffffff', border: '1px solid #000000' }
            : { backgroundColor: isBlackTheme ? '#FFFFFF' : theme.palette[0] }
          }
          title={isEn ? "Sections & Categories" : "الأقسام والتصنيفات"}
          aria-label={isEn ? "Sections & Categories" : "الأقسام والتصنيفات"}
        >
          <i className={`fa-solid ${isMenuOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
        </button>
      </div>

      {/* Zoom Modal - Matches identical style & behavior of Adhkar & Duas pages */}
      {zoomedDuaa && (
        <div 
          className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm" 
          onClick={() => setZoomedDuaa(null)}
        >
          <div 
            className="bg-modal-bg text-modal-text p-6 sm:p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
            style={{ 
              fontFamily: isEn ? 'inherit' : theme.font,
              borderColor: theme.palette[0] || '#059669'
            }} 
            onClick={e => e.stopPropagation()}
            dir={isEn ? 'ltr' : 'rtl'}
          >
            <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
              {/* Ruqyah Text */}
              {isEn ? (
                <div 
                  className="text-xl md:text-2xl leading-relaxed font-sans font-medium text-center my-4 select-none text-balance"
                  dir="ltr"
                >
                  {zoomedDuaa.textEn || zoomedDuaa.text}
                </div>
              ) : (
                <div 
                  className="text-3xl md:text-4xl leading-relaxed font-amiri text-center select-none"
                  dir="rtl"
                >
                  {zoomedDuaa.text}
                </div>
              )}

              {/* Subtitle in Emerald Green */}
              <p 
                className="text-base sm:text-lg mt-6 font-bold font-cairo" 
                style={{ color: theme.palette[0] || '#059669' }} 
                dir={isEn ? 'ltr' : 'rtl'}
              >
                {isEn 
                  ? (zoomedDuaa.type === 'quran'
                      ? `From the Holy Qur'an (${zoomedDuaa.sourceEn || zoomedDuaa.source})`
                      : `From the Prophetic Sunnah (${zoomedDuaa.sourceEn || zoomedDuaa.source})`)
                  : (zoomedDuaa.type === 'quran'
                      ? `من آيات الرقية من القرآن الكريم (${zoomedDuaa.source})`
                      : `من أدعية الرقية من السنة النبوية (${zoomedDuaa.source})`)}
              </p>
            </div>

            {/* Bottom Action Buttons: Share as Image & Close */}
            <div className="mt-6 shrink-0 flex items-center gap-3" dir={isEn ? 'ltr' : 'rtl'}>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleShare(zoomedDuaa, e);
                }} 
                className="flex-1 py-3 sm:py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 hover:opacity-95 active:scale-98 transition-all shadow-md cursor-pointer"
                style={{ backgroundColor: theme.palette[0] || '#059669' }}
                title={isEn ? "Share Image" : "مشاركة كصورة"}
              >
                <i className="fa-solid fa-share-nodes text-lg"></i>
                <span>{isEn ? 'Share Image' : 'مشاركة كصورة'}</span>
              </button>
              <button 
                onClick={() => setZoomedDuaa(null)} 
                className="flex-1 py-3 sm:py-3.5 rounded-2xl font-bold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 active:scale-98 transition-all cursor-pointer"
              >
                {isEn ? 'Close' : 'إغلاق'}
              </button>
            </div>
          </div>
        </div>
      )}

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
