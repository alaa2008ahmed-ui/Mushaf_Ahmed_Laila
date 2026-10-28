
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Home, BookOpen, Headphones, Clock, Calendar, Brain, 
    Mic, Settings, Palette, MessageCircle, X, ChevronLeft, ChevronRight,
    Menu, Info, HelpCircle, Star, Type, Bell, Compass, Search,
    ScrollText, Award
} from 'lucide-react';
import { THEMES } from './QuranReader/constants';
import { useShowNewBadge, useSeenPages, markPageAsSeen } from '../utils/badgeManager';
import { useLanguage } from '../context/LanguageContext';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    onOpenThemes: () => void;
    currentTheme: any;
    currentPage: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, onOpenThemes, currentTheme: _appTheme, currentPage }) => {
    const showNewBadges = useShowNewBadge();
    const { isPageSeen } = useSeenPages();
    const { t, translateMenuItem, isRTL } = useLanguage();
    const [readerTheme, setReaderTheme] = React.useState(() => {
        try {
            const themeId = localStorage.getItem('current_theme_id_v') || 'black';
            return THEMES[themeId as keyof typeof THEMES] || THEMES.black;
        } catch (e) {
            return THEMES.black;
        }
    });

    React.useEffect(() => {
        const handleThemeChange = () => {
            try {
                const themeId = localStorage.getItem('current_theme_id_v') || 'black';
                setReaderTheme(THEMES[themeId as keyof typeof THEMES] || THEMES.black);
            } catch (e) {}
        };
        window.addEventListener('theme-change', handleThemeChange);
        return () => window.removeEventListener('theme-change', handleThemeChange);
    }, []);

    const currentTheme = {
        ...readerTheme,
        modalBg: readerTheme.modalBg || readerTheme.bg,
        textColor: readerTheme.text || readerTheme.modalText || '#000000',
        barBorder: readerTheme.barBorder || '#eeeeee',
        accent: readerTheme.accent || '#3b82f6'
    };

    const menuItems = [
        { id: 'ten-promised', label: t('menu.ten_promised', 'العشرة المبشرون'), icon: Award, color: '#10b981', description: t('sidemenu.ten_promised_desc', 'سير وأحوال وفضائل ومواقف العشرة المبشرين بالجنة.') },
        { id: 'prophetic-seerah', label: t('menu.prophetic_seerah', 'السيرة النبوية'), icon: ScrollText, color: '#f59e0b', description: t('sidemenu.prophetic_seerah_desc', 'خط زمني تفاعلي لمحطات السيرة العطرة والعبر المستفادة.') },
        { id: 'search', label: t('sidemenu.search', 'البحث المتقدم'), icon: Search, color: '#14b8a6', description: t('sidemenu.search_desc', 'البحث عن آية، أو دعاء، أو أذكار.') },
        { id: 'habit-tracker', label: t('menu.habit_tracker', 'مربّي العبادات'), icon: Calendar, color: '#ec4899', description: t('sidemenu.habit_tracker_desc', 'متابعة الصلاة وتلاوة القرآن والأذكار والأهداف اليومية.') },
        { id: 'home', label: t('sidemenu.home', 'الرئيسية'), icon: Home, color: '#3b82f6', description: t('sidemenu.home_desc', 'العودة إلى الشاشة الرئيسية للتطبيق.') },
        { id: 'quran', label: t('menu.quran', 'القرآن الكريم'), icon: BookOpen, color: '#10b981', description: t('sidemenu.quran_desc', 'يقوم بعرض النص القرآني والتلاوة والتفسير والترجمة.') },
        { id: 'listen', label: t('sidemenu.listen', 'الاستماع'), icon: Headphones, color: '#8b5cf6', description: t('sidemenu.listen_desc', 'الاستماع إلى تلاوات كبار القراء بمختلف الروايات.') },
        { id: 'prayer-times', label: t('menu.prayer_times', 'مواقيت الصلاة'), icon: Clock, color: '#f59e0b', description: t('sidemenu.prayer_times_desc', 'عرض مواقيت الصلاة واتجاه القبلة لموقعك الحالي.') },
        { id: 'daily-wird', label: t('menu.daily_wird', 'الورد اليومي'), icon: Calendar, color: '#ec4899', description: t('sidemenu.daily_wird_desc', 'متابعة وردك اليومي من القرآن والأذكار.') },
        { id: 'memorization', label: t('menu.memorization', 'التحفيظ'), icon: Brain, color: '#06b6d4', description: t('sidemenu.memorization_desc', 'أدوات مساعدة لحفظ ومراجعة القرآن الكريم.') },
        { id: 'voice-control', label: t('menu.voice_control', 'التحكم الصوتي'), icon: Mic, color: '#ef4444', description: t('sidemenu.voice_control_desc', 'التحكم في التطبيق من خلال الأوامر الصوتية.') },
        { id: 'readers', label: t('sidemenu.readers', 'القراء'), icon: Headphones, color: '#8b5cf6', description: t('sidemenu.readers_desc', 'اختر قارئك المفضل للاستماع إلى التلاوة العطرة.') },
        { id: 'font-type', label: t('sidemenu.font_type', 'نوع الخط'), icon: Type, color: '#10b981', description: t('sidemenu.font_type_desc', 'تغيير نوع الخط بما يناسب راحتك في القراءة.') },
        { id: 'notifications', label: t('sidemenu.notifications', 'الإشعارات'), icon: Bell, color: '#f59e0b', description: t('sidemenu.notifications_desc', 'يمكنك الوصول الى اشعارات التطبيق واشعارات الهاتف والتعديل عليها بما يناسبك') },
        { id: 'sajdah', label: t('sidemenu.sajdah', 'آيات السجدة'), icon: Compass, color: '#ec4899', description: t('sidemenu.sajdah_desc', 'قائمة بجميع مواضع السجدات في القرآن الكريم للوصول السريع.') },
        { id: 'settings', label: t('sidemenu.settings', 'الإعدادات'), icon: Settings, color: '#6366f1', description: t('sidemenu.settings_desc', 'التحكم الكامل بالتطبيق من داخل هذا الزر') },
        { id: 'themes', label: t('sidemenu.themes', 'الثيمات'), icon: Palette, color: '#f43f5e', description: t('sidemenu.themes_desc', 'تغيير ألوان ومظهر التطبيق بالكامل.') },
        { id: 'whatsapp', label: t('sidemenu.whatsapp', 'تواصل معنا'), icon: MessageCircle, color: '#22c55e', description: t('sidemenu.whatsapp_desc', 'تواصل مباشر معنا للاقتراحات أو الدعم الفني.') },
    ];

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={onClose}
                            className="fixed inset-0 bg-black/40 z-[10000]"
                        />
                        
                        {/* Menu Content */}
                        <motion.div 
                            initial={{ x: isRTL ? '100%' : '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: isRTL ? '100%' : '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} h-full w-[280px] z-[10001] shadow-2xl flex flex-col`}
                            style={{ backgroundColor: currentTheme.modalBg || '#ffffff', color: currentTheme.textColor }}
                            dir={isRTL ? 'rtl' : 'ltr'}
                        >
                            {/* Header */}
                            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: currentTheme.barBorder }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: currentTheme.accent }}>
                                        <BookOpen size={24} color="#fff" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base leading-tight">{t('app.name', 'مصحف أحمد و ليلى')}</h2>
                                        <p className="text-xs font-semibold opacity-75">Mushaf Ahmed & Laila</p>
                                        <p className="text-[10px] opacity-50">{t('app.version', 'الإصدار 1.13')}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Menu Items */}
                            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                                {menuItems.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            markPageAsSeen(item.id);
                                            if (item.id === 'themes') onOpenThemes();
                                            else if (item.id === 'whatsapp') window.open('https://wa.me/201000000000', '_blank');
                                            else if (item.id === 'notifications') onNavigate('phone-notifications');
                                            else if (item.id === 'settings' || item.id === 'readers' || item.id === 'font-type' || item.id === 'sajdah') onNavigate('settings');
                                            else if (item.id === 'home') onNavigate('home', { force: true });
                                            else onNavigate(item.id);
                                            onClose();
                                        }}
                                        className="side-menu-item w-full flex items-center gap-4 p-3.5 rounded-xl transition-all hover:bg-black/5 active:scale-95 group"
                                        data-id={`side-menu-${item.id}`}
                                    >
                                        <div 
                                            className="w-10 h-10 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all"
                                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                        >
                                            <item.icon size={22} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-[15px]">{item.label}</span>
                                            {showNewBadges && (item.id === 'prophetic-seerah' || item.id === 'ten-promised') && !isPageSeen(item.id) && (
                                                <span 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markPageAsSeen(item.id);
                                                    }}
                                                    className="bg-yellow-400 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs border border-white dark:border-slate-800 cursor-pointer select-none scale-75 origin-center inline-block"
                                                    title={t('common.new', 'جديد')}
                                                >
                                                    {t('common.new', 'جديد')}
                                                </span>
                                            )}
                                        </div>
                                        {isRTL ? (
                                            <ChevronLeft size={16} className="mr-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                                        ) : (
                                            <ChevronRight size={16} className="ml-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t mt-auto" style={{ borderColor: currentTheme.barBorder }}>
                                <div className="flex items-center justify-around">
                                    <button data-id="side-menu-about" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <Info size={20} />
                                        <span className="text-[10px] font-bold">{t('sidemenu.about', 'عن التطبيق')}</span>
                                    </button>
                                    <button data-id="side-menu-help" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <HelpCircle size={20} />
                                        <span className="text-[10px] font-bold">{t('sidemenu.help', 'المساعدة')}</span>
                                    </button>
                                    <button data-id="side-menu-rate" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <Star size={20} />
                                        <span className="text-[10px] font-bold">{t('sidemenu.rate', 'تقييمنا')}</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default SideMenu;
