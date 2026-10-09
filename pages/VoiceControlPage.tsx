
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl, VoiceCommand } from '../context/VoiceControlContext';
import { Mic, MicOff, Trash2, Edit2, Check, X, Plus, RotateCcw, ChevronRight, WifiOff, BookOpen } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import BottomBar from '../components/BottomBar';
import TutorialOverlay, { TutorialStep } from '../components/Tutorial/TutorialOverlay';

import ThemePageLock from '../components/ThemePageLock';

const AVAILABLE_ACTIONS = [
    { id: 'go_home', name: 'الرئيسية' },
    { id: 'open_quran', name: 'مصحف / صفحة القراءة / القرآن الكريم' },
    { id: 'open_prayer', name: 'مواقيت الصلاة / مواقيت الصلاه' },
    { id: 'open_qibla', name: 'القبلة / القبله' },
    { id: 'open_tasbeeh', name: 'السبحه / السبحه' },
    { id: 'open_athkar', name: 'الأذكار/ الاذكار' },
    { id: 'open_salah_adhkar', name: 'أذكار الصلاة / اذكار الصلاه' },
    { id: 'open_hisn_muslim', name: 'حصن المسلم / حصن المسلم / حسن المسلم' },
    { id: 'open_calendar', name: 'التقويم / التقويم' },
    { id: 'open_listen', name: 'الاستماع للقرآن / الاستماع للقران' },
    { id: 'open_settings', name: 'الإعدادات/ الاعدادات' },
    { id: 'open_themes', name: 'الثيمات / ثيمات / السيمات' },
    { id: 'open_voice_control', name: 'التحكم الصوتي / التحكم الصوتى' },
    { id: 'open_adia', name: 'الادعيه / الادعيه' },
    { id: 'open_hajj_umrah', name: 'الحج والعمرة' },
    { id: 'open_asmaul_husna', name: 'أسماء الله الحسنى' },
    { id: 'open_islamic_sites', name: 'مواقع إسلامية / مواقع اسلامية' },
    { id: 'open_daily_wird', name: 'الورد اليومي' },
    { id: 'open_memorization', name: 'التحفيظ' },
    { id: 'open_more', name: 'قائمة التطبيقات' },
    { id: 'open_nawawi', name: 'الأربعون النووية / الاربعون النوويه' },
    { id: 'go_back', name: 'رجوع' },
    { id: 'exit_app', name: 'خروج' },
    { id: 'increase_font', name: 'تكبير الخط / تكبير' },
    { id: 'decrease_font', name: 'تصغير الخط / تصغير' },
    { id: 'change_theme', name: 'تغيير لون الخلفية/ لون الخلفيه' },
    { id: 'play_audio', name: 'تشغيل الصوت / تشغيل' },
    { id: 'stop_audio', name: 'إيقاف الصوت / إيقاف' },
    { id: 'show_tafsir', name: 'عرض التفسير' },
    { id: 'open_bookmarks', name: 'فتح العلامات' },
    { id: 'toggle_auto_scroll', name: 'تشغيل التمرير التلقائى/ التمرير التلقائى' },
    { id: 'faster_auto_scroll', name: 'اسرع' },
    { id: 'slower_auto_scroll', name: 'ابطئ' },
    { id: 'pause_auto_scroll', name: 'ايقاف التمرير' },
    { id: 'stop_auto_scroll', name: 'اغلاق التمرير' },
    { id: 'open_share', name: 'المشاركه / مشاركه' },
    { id: 'open_search', name: 'فتح البحث / بحث' },
    { id: 'close_modal', name: 'اغلاق القائمه / اغلاق' },
    { id: 'next_page', name: 'الصفحة التالية' },
    { id: 'prev_page', name: 'الصفحة السابقة' },
    { id: 'disable_voice_control', name: 'إيقاف التحكم الصوتي' },
];

const VoiceControlPage: React.FC<{ onBack: () => void, onNavigate: (pageId: string) => void }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { 
        isEnabled, 
        setIsEnabled, 
        isListening, 
        transcript, 
        commands, 
        updateCommand, 
        addCommand, 
        deleteCommand,
        resetToDefaults,
        showVoiceIcon,
        setShowVoiceIcon
    } = useVoiceControl();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');
    const [showAddCommand, setShowAddCommand] = useState(false);
    const [newPhrase, setNewPhrase] = useState('');
    const [newAction, setNewAction] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const handleToggleVoiceControl = () => {
        if (!isEnabled) {
            if (!navigator.onLine) {
                setToastMessage('لا يتوفر إنترنت لتشغيل التحكم الصوتي. يرجى التحقق من اتصالك.');
            } else {
                setToastMessage('تم تفعيل التحكم الصوتي بنجاح.');
            }
        } else {
            setToastMessage('تم تعطيل التحكم الصوتي.');
        }
        
        // Hide toast after 3 seconds
        setTimeout(() => setToastMessage(''), 3000);
        
        setIsEnabled(!isEnabled);
    };

    const handleEdit = (cmd: VoiceCommand) => {
        setEditingId(cmd.id);
        setEditValue(cmd.phrase);
    };

    const handleSaveEdit = (id: string) => {
        if (editValue.trim()) {
            updateCommand(id, editValue.trim());
            setEditingId(null);
        }
    };

    const handleAdd = () => {
        if (newPhrase.trim() && newAction) {
            addCommand(newPhrase.trim(), newAction);
            setNewPhrase('');
            setNewAction('');
            setShowAddCommand(false);
        }
    };

    const voiceControlTutorialSteps: TutorialStep[] = [
        {
            id: 'voice-welcome',
            title: 'التحكم الصوتي الذكي',
            text: 'مرحباً بك في عالم التحكم الصوتي. هذه الميزة تتيح لك التحدث مع التطبيق كما تتحدث مع صديقك. يمكنك طلب أي شيء من التطبيق باللغة العربية الفصحى أو العامية المصرية، وسيفهمك المساعد الذكي وينفذ طلبك فوراً.',
            position: { top: '60%' },
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'voice-toggle',
            title: 'تفعيل الاستماع المستمر',
            text: 'هذا الزر هو مفتاح التحكم؛ عند تفعيله، سيظل التطبيق في حالة "استماع" دائمة لأوامرك. يمكنك وضعه بجانبك أثناء القراءة وقول "الآية التالية" أو "شغل التفسير" دون الحاجة للمس الهاتف إطلاقاً.',
            selector: '#voice-toggle-btn',
            icon: <Mic className="w-8 h-8 text-white" />
        },
        {
            id: 'voice-commands-list',
            title: 'أمثلة للأوامر الصوتية',
            text: 'هنا تجد دليلاً شاملاً للأوامر: يمكنك قول "افتح سورة الكهف"، "مواقيت الصلاة في القاهرة"، "شغل أذكار الصباح"، أو حتى "غير الثيم للوضع الليلي". استكشف القائمة لتتعرف على قدرات المساعد الصوتي المذهلة.',
            selector: '#commands-list-container',
            position: { top: '65%' },
            icon: <ChevronRight className="w-8 h-8 text-white" />
        }
    ];

    return (
        <div className="h-screen flex flex-col bg-transparent overflow-hidden">
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">التحكم الصوتي</h1>
                    </div>
                    <p className="app-top-bar__subtitle">إدارة الأوامر الصوتية الذكية</p>
                </div>
            </header>

            <main className="w-full flex-1 flex flex-col items-center overflow-hidden px-4 pb-4">
                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar pb-6 space-y-6">
                    {/* Merged Status & Settings Section */}
                    <div className="themed-card p-4 space-y-4 relative">
                        {toastMessage && (
                            <motion.div 
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg z-50 whitespace-nowrap"
                            >
                                {toastMessage}
                            </motion.div>
                        )}
                        
                        {/* Mic Button Section */}
                        <div className="flex flex-col items-center justify-center space-y-3">
                            <motion.button 
                                id="voice-toggle-btn"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleVoiceControl}
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all ${isEnabled && isListening ? 'animate-pulse' : ''}`}
                                style={{ 
                                    backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                    color: '#ffffff'
                                }}
                            >
                                {isEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                            </motion.button>
                            <div className="text-center">
                                <p className="text-base font-bold">
                                    {isEnabled ? (isListening ? 'جاري الاستماع...' : 'التحكم الصوتي مفعل') : 'التحكم الصوتي معطل'}
                                </p>
                                <p className="text-[10px] opacity-60 mt-0.5">
                                    {isEnabled ? 'يمكنك التحدث بالأوامر من أي مكان في التطبيق' : 'اضغط على الزر لتفعيل الاستماع الدائم'}
                                </p>
                            </div>
                            
                            {transcript && isListening && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-black/5 w-full text-center italic font-bold text-base border border-black/5"
                                >
                                    "{transcript}"
                                </motion.div>
                            )}
                        </div>

                        <div className="h-px bg-black/5 w-full"></div>

                        {/* Toggle Section */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">أيقونة التحكم الصوتي</h3>
                                <p className="text-[10px] opacity-60 mt-0.5">إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية</p>
                            </div>
                            <button 
                                onClick={() => setShowVoiceIcon(!showVoiceIcon)}
                                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
                                style={{ backgroundColor: showVoiceIcon ? (themeKey === 'default' ? '#000000' : theme.palette[0]) : '#9ca3af' }}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showVoiceIcon ? '-translate-x-5' : '-translate-x-0.5'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div id="commands-list-container" className="themed-card p-6 space-y-6">
                        <h3 className="font-bold text-lg flex items-center gap-2 border-b pb-2">
                            <ChevronRight className="w-5 h-5 text-primary" />
                            دليل التحكم الصوتي الشامل
                        </h3>
                        
                        <div className="space-y-6 text-sm opacity-90 leading-relaxed">
                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    1. أوامر التنقل العامة (تعمل من أي مكان في التطبيق):
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1 text-xs">
                                    <li>"الرئيسية": للعودة إلى الشاشة الرئيسية.</li>
                                    <li>"مصحف" / "صفحة القراءة" / "القرآن الكريم": لفتح المصحف الشريف.</li>
                                    <li>"فتح مواقيت الصلاة" / "مواقيت الصلاه": للانتقال لصفحة مواقيت الصلاة.</li>
                                    <li>"فتح القبلة" / "القبله": لفتح بوصلة القبلة.</li>
                                    <li>"فتح السبحه" / "السبحه": لفتح المسبحة الإلكترونية.</li>
                                    <li>"فتح الأذكار" / "الاذكار": لفتح أذكار الصباح والمساء.</li>
                                    <li>"فتح أذكار الصلاة" / "اذكار الصلاه": لفتح الأذكار بعد الصلاة.</li>
                                    <li>"فتح حصن المسلم" / "حصن المسلم" / "حسن المسلم": لفتح كتاب حصن المسلم.</li>
                                    <li>"فتح التقويم" / "التقويم": لفتح التقويم الهجري والميلادي.</li>
                                    <li>"فتح الاستماع للقرآن" / "الاستماع للقران": لفتح صفحة الاستماع لمشاهير القراء.</li>
                                    <li>"فتح الإعدادات" / "الاعدادات": لفتح صفحة إعدادات التطبيق.</li>
                                    <li>"فتح الثيمات" / "ثيمات" / "السيمات" / "سيمات": لفتح قائمة تغيير ألوان ومظهر التطبيق (أو ثيمات القراءة إذا كنت داخل المصحف).</li>
                                    <li>"فتح التحكم الصوتي" / "التحكم الصوتى": للانتقال لإعدادات التحكم الصوتي.</li>
                                    <li>"فتح الادعيه" / "الادعيه": لفتح صفحة الادعيه.</li>
                                    <li>"فتح الحج والعمرة" / "الحج والعمرة": لفتح صفحه الحج والعمرة.</li>
                                    <li>"فتح قائمة التطبيقات" / "قائمة التطبيقات": لفتح صفحة قائمة التطبيقات (من الصفحة الرئيسية).</li>
                                    <li>"فتح الأربعون النووية" / "الاربعون النوويه": لفتح صفحة الأربعون النووية.</li>
                                    <li>"رجوع": للعودة الى الصفحه السابقة.</li>
                                    <li>"خروج": لإغلاق التطبيق.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    2. التنقل الذكي في المصحف:
                                </h4>
                                <p className="pr-4">النظام يفهم السياق؛ إذا كنت تقرأ في المصحف ونطقت رقماً فقط (مثل "عشرين")، سينتقل بك إلى الآية 20 في السورة الحالية. كما يمكنك استخدام:</p>
                                <ul className="list-disc list-inside pr-6 space-y-1 text-xs">
                                    <li>"سورة [اسم السورة]" للانتقال لبداية السورة.</li>
                                    <li>"صفحة [رقم]" للانتقال لصفحة محددة.</li>
                                    <li>"جزء [رقم]" للانتقال لبداية الجزء.</li>
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className="font-bold text-primary flex items-center gap-2">
                                    <div className="w-1.5 h-4 bg-primary rounded-full"></div>
                                    3. أوامر التحكم في صفحة القراءة والمظهر:
                                </h4>
                                <ul className="list-disc list-inside pr-4 space-y-1 text-xs">
                                    <li>"تكبير الخط" / "تكبير": لزيادة حجم خط القراءة بمقدار 0.1.</li>
                                    <li>"تصغير الخط" / "تصغير": لتقليل حجم خط القراءة بمقدار 0.1.</li>
                                    <li>"حجم الخط [رقم]": لضبط الخط على مقاس محدد (مثال: "حجم الخط ٢٤").</li>
                                    <li>"تغيير لون الخلفية" / "لون الخلفيه": لتبديل مظهر المصحف.</li>
                                    <li>"تشغيل الصوت" / "تشغيل": لبدء تلاوة الآيات في الصفحة الحالية.</li>
                                    <li>"إيقاف الصوت" / "إيقاف": لإيقاف التلاوة.</li>
                                    <li>"عرض التفسير": لفتح نافذة التفسير للآيات.</li>
                                    <li>"فتح العلامات": لفتح قائمة الإشارات المرجعية المحفوظة.</li>
                                    <li>"تشغيل التمرير التلقائى" / "التمرير التلقائى": لتفعيل التمرير التلقائى وتشغيله.</li>
                                    <li>"اسرع" / "ابطئ": لزياده وابطاء سرعة التمرير التلقائى.</li>
                                    <li>"ايقاف التمرير" / "ايقاف مؤقت": لايقاف التمرير مؤقتا.</li>
                                    <li>"اغلاق التمرير" / "ايقاف كامل": لايقاف التمرير نهائيا.</li>
                                    <li>"المشاركه" / "مشاركه": لفتح قائمة المشاركه.</li>
                                    <li>"فتح البحث" / "بحث": لفتح محرك البحث في القرآن.</li>
                                    <li>"اغلاق القائمه" / "اغلاق": لاغلاق اى قائمة مفتوحة (في صفحة القراءة).</li>
                                </ul>
                            </section>

                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs italic">
                                * نصيحة: لا تقلق بشأن التشكيل أو "ال" التعريف، النظام ذكي بما يكفي ليفهم "البقرة" أو "بقرة" بنفس الدقة.
                            </div>
                        </div>
                    </div>

                    {/* Offline Warning & Settings Section */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                            <WifiOff className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-amber-700 text-sm mb-1">تنبيه هام: يتطلب اتصال بالإنترنت</h4>
                                <p className="text-xs text-amber-700/80 leading-relaxed">
                                    خاصية التحكم الصوتي تعتمد على محرك التعرف على الصوت الخاص بجهازك (مثل Google أو Apple)، والذي <strong>لا يعمل إلا عند توفر اتصال بالإنترنت</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="mt-2 pt-3 border-t border-amber-500/20">
                            <h4 className="font-bold text-amber-700 text-sm mb-2">لتشغيل التحكم الصوتي بدون إنترنت (أوفلاين):</h4>
                            <p className="text-xs text-amber-700/80 leading-relaxed mb-3">
                                يجب التأكد من تحميل حزمة اللغة العربية للتعرف على الصوت في إعدادات نظام أندرويد لضمان عمل التطبيق بكفاءة في وضع الأوفلاين:
                            </p>
                            
                            <ul className="text-xs text-amber-700/80 leading-relaxed list-disc list-inside space-y-1 pr-2">
                                <li><strong>أجهزة أندرويد (Android):</strong> الإعدادات &gt; الإدارة العامة (أو النظام) &gt; اللغة والإدخال &gt; لوحة المفاتيح التي تظهر على الشاشة &gt; الكتابة بالصوت من Google &gt; التعرف على الصوت بلا اتصال بالإنترنت &gt; تحميل اللغة العربية.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="shrink-0 w-full h-32"></div>
                </div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
            <TutorialOverlay tutorialId="voice-control-tutorial" steps={voiceControlTutorialSteps} />
        </div>
    );
};

export default VoiceControlPage;
