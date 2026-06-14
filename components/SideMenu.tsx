
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Home, BookOpen, Headphones, Clock, Calendar, Brain, 
    Mic, Settings, Palette, MessageCircle, X, ChevronLeft,
    Menu, Info, HelpCircle, Star, Type, Bell, Compass, Search
} from 'lucide-react';
import TutorialOverlay, { TutorialStep } from './Tutorial/TutorialOverlay';
import { THEMES } from './QuranReader/constants';

interface SideMenuProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (pageId: string, params?: any) => void;
    onOpenThemes: () => void;
    currentTheme: any;
    currentPage: string;
}

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onNavigate, onOpenThemes, currentTheme: _appTheme, currentPage }) => {
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
        { id: 'search', label: 'البحث المتقدم', icon: Search, color: '#14b8a6', description: 'البحث عن آية، أو دعاء، أو أذكار.' },
        { id: 'habit-tracker', label: 'مربّي العبادات', icon: Calendar, color: '#ec4899', description: 'متابعة الصلاة وتلاوة القرآن والأذكار والأهداف اليومية.' },
        { id: 'home', label: 'الرئيسية', icon: Home, color: '#3b82f6', description: 'العودة إلى الشاشة الرئيسية للتطبيق.' },
        { id: 'quran', label: 'القرآن الكريم', icon: BookOpen, color: '#10b981', description: 'يقوم بعرض النص القرانى والترجمه باللغه الانجليزيه' },
        { id: 'listen', label: 'الاستماع', icon: Headphones, color: '#8b5cf6', description: 'الاستماع إلى تلاوات كبار القراء بمختلف الروايات.' },
        { id: 'prayer-times', label: 'مواقيت الصلاة', icon: Clock, color: '#f59e0b', description: 'عرض مواقيت الصلاة واتجاه القبلة لموقعك الحالي.' },
        { id: 'daily-wird', label: 'الورد اليومي', icon: Calendar, color: '#ec4899', description: 'متابعة وردك اليومي من القرآن والأذكار.' },
        { id: 'memorization', label: 'التحفيظ', icon: Brain, color: '#06b6d4', description: 'أدوات مساعدة لحفظ ومراجعة القرآن الكريم.' },
        { id: 'voice-control', label: 'التحكم الصوتي', icon: Mic, color: '#ef4444', description: 'التحكم في التطبيق من خلال الأوامر الصوتية.' },
        { id: 'readers', label: 'القراء', icon: Headphones, color: '#8b5cf6', description: 'اختر قارئك المفضل للاستماع إلى التلاوة العطرة.' },
        { id: 'font-type', label: 'نوع الخط', icon: Type, color: '#10b981', description: 'تغيير نوع الخط بما يناسب راحتك في القراءة.' },
        { id: 'notifications', label: 'الإشعارات', icon: Bell, color: '#f59e0b', description: 'يمكنك الوصول الى اشعارات التطبيق واشعارات الهاتف والتعديل عليها بما يناسبك' },
        { id: 'sajdah', label: 'آيات السجدة', icon: Compass, color: '#ec4899', description: 'قائمة بجميع مواضع السجدات في القرآن الكريم للوصول السريع.' },
        { id: 'settings', label: 'الإعدادات', icon: Settings, color: '#6366f1', description: 'التحكم الكامل بالتطبيق من داخل هذا الزر' },
        { id: 'themes', label: 'الثيمات', icon: Palette, color: '#f43f5e', description: 'تغيير ألوان ومظهر التطبيق بالكامل.' },
        { id: 'whatsapp', label: 'تواصل معنا', icon: MessageCircle, color: '#22c55e', description: 'تواصل مباشر معنا للاقتراحات أو الدعم الفني.' },
    ];

    const sideMenuTutorialSteps: TutorialStep[] = [
        {
            id: 'side-menu-welcome',
            title: 'القائمة الجانبية الشاملة',
            text: 'توفر لك هذه القائمة وصولاً سريعاً لجميع أقسام التطبيق من أي مكان. يمكنك التنقل بين القرآن، الأذكار، والمواقيت بضغطة واحدة.',
            icon: <Menu className="w-8 h-8 text-white" />
        },
        ...menuItems.map(item => ({
            id: `tutorial-${item.id}`,
            title: item.label,
            text: item.description,
            selector: `[data-id="side-menu-${item.id}"]`,
            icon: <item.icon size={32} className="text-white" />
        })),
        {
            id: 'tutorial-about',
            title: 'عن التطبيق',
            text: 'تعرف على فريق العمل، الإصدار الحالي، وأهداف هذا المشروع المبارك.',
            selector: '[data-id="side-menu-about"]',
            icon: <Info size={32} className="text-white" />
        },
        {
            id: 'tutorial-help',
            title: 'المساعدة',
            text: 'هل لديك استفسار؟ هنا تجد إجابات لأكثر الأسئلة شيوعاً ودليل الاستخدام.',
            selector: '[data-id="side-menu-help"]',
            icon: <HelpCircle size={32} className="text-white" />
        },
        {
            id: 'tutorial-rate',
            title: 'تقييمنا',
            text: 'رأيك يهمنا جداً! تقييمك للتطبيق يساعدنا على الوصول لعدد أكبر من المسلمين وتطوير الخدمات.',
            selector: '[data-id="side-menu-rate"]',
            icon: <Star size={32} className="text-white" />
        }
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
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-[280px] z-[10001] shadow-2xl flex flex-col"
                            style={{ backgroundColor: currentTheme.modalBg || '#ffffff', color: currentTheme.textColor }}
                        >
                            {/* Header */}
                            <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: currentTheme.barBorder }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: currentTheme.accent }}>
                                        <BookOpen size={24} color="#fff" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-lg leading-tight">مصحف أحمد وليلى</h2>
                                        <p className="text-xs opacity-60">الإصدار 1.13</p>
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
                                        <span className="font-bold text-[15px]">{item.label}</span>
                                        <ChevronLeft size={16} className="mr-auto opacity-30 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t mt-auto" style={{ borderColor: currentTheme.barBorder }}>
                                <div className="flex items-center justify-around">
                                    <button data-id="side-menu-about" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <Info size={20} />
                                        <span className="text-[10px] font-bold">عن التطبيق</span>
                                    </button>
                                    <button data-id="side-menu-help" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <HelpCircle size={20} />
                                        <span className="text-[10px] font-bold">المساعدة</span>
                                    </button>
                                    <button data-id="side-menu-rate" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
                                        <Star size={20} />
                                        <span className="text-[10px] font-bold">تقييمنا</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                        <TutorialOverlay tutorialId="side-menu-tutorial" steps={sideMenuTutorialSteps} />
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default SideMenu;
