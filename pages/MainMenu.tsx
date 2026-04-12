
import React, { useState, useEffect } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import WhatsAppButton from '../components/WhatsAppButton';
import InteractiveBackground from '../components/InteractiveBackground';
import { verses } from '../data/mainMenuData';
import MenuCustomizationModal from '../components/MenuCustomizationModal';
import PasscodeModal from '../components/PasscodeModal';
import { registerBackInterceptor } from '../hooks/useBackButton';
import VerseSection from '../components/MainMenu/VerseSection';
import TitleSection from '../components/MainMenu/TitleSection';
import GridSection from '../components/MainMenu/GridSection';
import FloatingNeonTicker from '../components/FloatingNeonTicker';
import VerseContextMenu from '../components/MainMenu/VerseContextMenu';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';
import { Mic, Palette, LayoutGrid, BookOpen } from 'lucide-react';

const ALL_POSSIBLE_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'daily-wird', label: "📅 الورد اليومي", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'memorization', label: "🧠 التحفيظ", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'voice-control', label: "🎙️ التحكم الصوتي", className: "col-span-2 h-12", colorIndex: 1 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'nawawi', label: "📚 الأربعون النووية", className: "h-10", colorIndex: 1 },
    { id: 'calculators', label: "🧮 الحاسبة الشرعية", className: "h-10", colorIndex: 1 },
    { id: 'more', label: "✨ المزيد", className: "col-span-2 h-10 flex justify-center", colorIndex: 0 },
];

const DEFAULT_MENU_ITEMS = [
    { id: 'quran', label: "📖 القرآن الكريم", className: "col-span-2 h-12", colorIndex: 0 },
    { id: 'listen', label: "🎧 الاستماع للقرآن", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'prayer-times', label: "⏱️ مواقيت الصلاة", className: "col-span-2 h-10", colorIndex: 0 },
    { id: 'adia', label: "🤲 الأدعية", className: "h-10", colorIndex: 1 },
    { id: 'sabah-masaa', label: "☀️ الأذكار", className: "h-10", colorIndex: 1 },
    { id: 'salah-adhkar', label: "🕌 أذكار الصلاة", className: "h-10", colorIndex: 1 },
    { id: 'hisn-muslim', label: "🛡️ حصن المسلم", className: "h-10", colorIndex: 1 },
    { id: 'tasbeeh', label: "📿 السبحة", className: "h-10", colorIndex: 1 },
    { id: 'calendar', label: "📅 التقويم", className: "h-10", colorIndex: 1 },
    { id: 'qibla', label: "🧭 القبلة", className: "h-10", colorIndex: 1 },
    { id: 'hajj-umrah', label: "🕋 الحج والعمرة", className: "h-10", colorIndex: 1 },
    { id: 'more', label: "✨ المزيد", className: "col-span-2 h-10 flex justify-center", colorIndex: 0 },
];

function MainMenu({ onNavigate, onOpenThemes }) {
  const [currentVerse] = useState(() => {
    const randomIndex = Math.floor(Math.random() * verses.length);
    return verses[randomIndex];
  });
  const { theme, themeKey } = useTheme();
  const [visibleItems, setVisibleItems] = useState<string[]>(() => {
    const savedVisible = localStorage.getItem('visibleMenuItems');
    return savedVisible ? JSON.parse(savedVisible) : DEFAULT_MENU_ITEMS.map(i => i.id);
  });
  const [menuItems, setMenuItems] = useState(() => {
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            return parsed;
        } catch (e) {
            return DEFAULT_MENU_ITEMS;
        }
    }
    return DEFAULT_MENU_ITEMS;
  });
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [isPasscodeOpen, setIsPasscodeOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [verseFontSize, setVerseFontSize] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseFontSize');
      return saved ? parseFloat(saved) : 1.25;
  });
  const [verseSettings, setVerseSettings] = useState(() => {
      const saved = localStorage.getItem('mainMenuVerseSettings');
      return saved ? JSON.parse(saved) : {
          fontFamily: theme.font,
          bgColor: 'transparent',
          textColor: theme.textColor
      };
  });
  const [isVerseMenuOpen, setIsVerseMenuOpen] = useState(false);

  const PREDEFINED_COLORS = [
      '#ffffff', '#f3f4f6', '#9ca3af', '#4b5563', '#000000',
      '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e',
      '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6',
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
      '#f43f5e', '#78716c', '#57534e', 'transparent'
  ];

  const renderCheckerboard = (color: string) => {
      if (color === 'transparent' || color === 'rgba(0, 0, 0, 0)') {
          return {
              backgroundColor: '#ffffff',
              backgroundImage: 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%)',
              backgroundSize: '8px 8px'
          };
      }
      return { backgroundColor: color };
  };

  const [isLandscape, setIsLandscape] = useState(window.innerWidth > window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSaveVerseSettings = (newSettings: any) => {
      setVerseSettings(newSettings);
      localStorage.setItem('mainMenuVerseSettings', JSON.stringify(newSettings));
  };

  const homeTutorialSteps: TutorialStep[] = [
    {
      id: 'welcome',
      text: 'أهلاً بك في تطبيق "مُصْحَفُ أَحْمَدَ وَلَيْلَى". إليك جولة سريعة للتعرف على المميزات الجديدة في هذا التحديث.',
      position: { top: '20%' },
      selector: '#app-title',
      arrow: 'up',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'verse',
      text: 'آية اليوم: تدبر آية جديدة يومياً. يمكنك الآن الضغط مطولاً على الآية لتخصيص مظهرها (الخط، الألوان، الخلفية).',
      position: { top: '30%' },
      selector: '#verse-section',
      arrow: 'up',
      icon: <BookOpen className="w-8 h-8 text-white" />
    },
    {
      id: 'grid',
      text: 'الأقسام الرئيسية: تم إضافة "الورد اليومي" و"التحفيظ" لتسهيل متابعة ختمتك وحفظك.',
      position: { top: '50%' },
      selector: '#grid-section',
      icon: <LayoutGrid className="w-8 h-8 text-white" />
    },
    {
      id: 'voice',
      text: 'التحكم الصوتي: ميزة جديدة تتيح لك التنقل في التطبيق وقراءة القرآن باستخدام أوامرك الصوتية.',
      position: { bottom: '120px', left: '20px' },
      selector: '#voice-control-btn',
      arrow: 'down',
      icon: <Mic className="w-8 h-8 text-white" />
    },
    {
      id: 'more-page',
      text: 'صفحة المزيد: اكتشف جميع أقسام التطبيق الإضافية والمميزات الجديدة في مكان واحد.',
      position: { bottom: '150px', right: '50%' },
      selector: '[data-item-id="more"]',
      arrow: 'down',
      icon: <LayoutGrid className="w-8 h-8 text-white" />
    },
    {
      id: 'themes',
      text: 'تخصيص المظهر: اختر من بين مجموعة واسعة من الثيمات والألوان التي تناسب ذوقك.',
      position: { bottom: '80px', left: '20%' },
      selector: '#themes-btn',
      arrow: 'down',
      icon: <Palette className="w-8 h-8 text-white" />
    },
    {
      id: 'whatsapp',
      text: 'تواصل معنا: يمكنك إرسال اقتراحاتك أو طلب تعديلات عبر الواتساب مباشرة.',
      position: { bottom: '100px', right: '20px' },
      selector: '#whatsapp-button-container',
      arrow: 'down',
      icon: <svg viewBox="0 0 24 24" className="w-8 h-8 text-white"><path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.361.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
    }
  ];

  const [currentTutorialStep, setCurrentTutorialStep] = useState<string>('');

  useEffect(() => {
    // Check if we need to update layout in storage (migration/fix)
    const savedLayout = localStorage.getItem('menuLayout');
    if (savedLayout) {
        try {
            const parsed = JSON.parse(savedLayout);
            let changed = false;
            const updated = parsed.map((item: any) => {
                if (item.id === 'calculators' || item.id === 'calendar') {
                    if (item.customColor) {
                        const { customColor, ...rest } = item;
                        changed = true;
                        return rest;
                    }
                }
                if (item.id === 'more' && !item.className.includes('flex justify-center')) {
                    changed = true;
                    return { ...item, className: "col-span-2 h-10 flex justify-center" };
                }
                return item;
            });
            
            if (changed) {
                localStorage.setItem('menuLayout', JSON.stringify(updated));
                setMenuItems(updated);
            }
        } catch (e) {
            // Error handled in initializer
        }
    }
  }, []);

  const handleCancelEdit = () => {
      const savedLayout = localStorage.getItem('menuLayout');
      if (savedLayout) {
          setMenuItems(JSON.parse(savedLayout));
      } else {
          setMenuItems(DEFAULT_MENU_ITEMS);
      }
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  useEffect(() => {
      const interceptor = () => {
          if (isCustomizationOpen) {
              setIsCustomizationOpen(false);
              return true;
          }
          if (isEditMode) {
              handleCancelEdit();
              return true;
          }
          return false;
      };
      const unregister = registerBackInterceptor(interceptor);
      return unregister;
  }, [isCustomizationOpen, isEditMode]);

  const handleSaveCustomization = (selectedIds: string[]) => {
      setVisibleItems(selectedIds);
      localStorage.setItem('visibleMenuItems', JSON.stringify(selectedIds));
  };

  const handleSaveLayout = () => {
      localStorage.setItem('menuLayout', JSON.stringify(menuItems));
      setIsEditMode(false);
      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate(50);
  };

  const handleResetLayout = () => {
      setMenuItems(DEFAULT_MENU_ITEMS);
      localStorage.removeItem('menuLayout');
      setIsEditMode(false);
      if (navigator.vibrate) navigator.vibrate(50);
  };

  return (
    <div className="fade-in">
      <InteractiveBackground />
      <div className="h-screen w-full flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden pb-32">
          <div className="main-layout px-4 h-full flex flex-col" style={{ fontFamily: theme.font }}>
              
              <div id="verse-section">
                <VerseSection 
                    currentVerse={currentVerse}
                    verseFontSize={verseFontSize}
                    setVerseFontSize={setVerseFontSize}
                    setIsCustomizationOpen={setIsVerseMenuOpen}
                    theme={theme}
                    themeKey={themeKey}
                    verseSettings={verseSettings}
                />
              </div>

              <TitleSection 
                  isEditMode={isEditMode}
                  setIsEditMode={setIsEditMode}
                  handleSaveLayout={handleSaveLayout}
                  handleResetLayout={handleResetLayout}
                  handleCancelEdit={handleCancelEdit}
                  theme={theme}
                  themeKey={themeKey}
              />

              <div id="grid-section">
                <GridSection 
                    menuItems={menuItems}
                    setMenuItems={setMenuItems}
                    visibleItems={visibleItems}
                    isEditMode={isEditMode}
                    onNavigate={(id) => {
                        if (id === 'more') onNavigate('more-menu');
                        else onNavigate(id);
                    }}
                    theme={theme}
                    themeKey={themeKey}
                    DEFAULT_MENU_ITEMS={DEFAULT_MENU_ITEMS}
                />
              </div>

              {/* Footer/Save Button */}
              {!isEditMode && (
                  <div className="themed-card p-2.5 rounded-2xl text-center w-full max-w-sm mx-auto mt-4 mb-4 relative">
                      <FloatingNeonTicker />
                      <p className="text-[14px] font-bold" style={{ color: themeKey === 'olive_grove' ? '#65A30D' : theme.textColor }}>
                          اللهم ارحمهما واغفر لهما واجعل مثواهما الجنة
                      </p>
                  </div>
              )}
          </div>
        </div>
      </div>

      <BottomBar 
        onHomeClick={() => {}} 
        onThemesClick={onOpenThemes} 
        showHome={false} 
        showThemes={true} 
        leftButton={<WhatsAppButton />}
      />
      
      <PasscodeModal 
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onSuccess={() => setIsCustomizationOpen(true)}
        isLandscape={isLandscape}
      />

      <MenuCustomizationModal 
        isOpen={isCustomizationOpen}
        onClose={() => setIsCustomizationOpen(false)}
        allItems={ALL_POSSIBLE_ITEMS}
        visibleIds={visibleItems}
        onSave={handleSaveCustomization}
        isLandscape={isLandscape}
      />

      <VerseContextMenu 
        isOpen={isVerseMenuOpen}
        onClose={() => setIsVerseMenuOpen(false)}
        settings={verseSettings}
        onSave={handleSaveVerseSettings}
        currentTheme={theme}
        renderCheckerboard={renderCheckerboard}
        PREDEFINED_COLORS={PREDEFINED_COLORS}
        isLandscape={isLandscape}
      />

      <TutorialOverlay 
        tutorialId="home-tutorial" 
        steps={homeTutorialSteps} 
        onStepChange={setCurrentTutorialStep}
      />
      {currentTutorialStep && (
        <style>{`
          #voice-control-btn {
            opacity: ${currentTutorialStep === 'voice' ? '1' : '0'} !important;
            pointer-events: ${currentTutorialStep === 'voice' ? 'auto' : 'none'} !important;
            z-index: 10005 !important;
            transition: opacity 0.3s ease !important;
          }
        `}</style>
      )}
    </div>
  );
}

export default MainMenu;
