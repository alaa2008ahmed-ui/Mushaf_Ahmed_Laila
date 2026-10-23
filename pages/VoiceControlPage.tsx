import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl, VoiceCommand } from '../context/VoiceControlContext';
import { Mic, MicOff, Trash2, Edit2, Check, X, Plus, RotateCcw, ChevronRight, BookOpen, ArrowLeft, ArrowRight, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { VOICE_CONTROL_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const VoiceControlPage: React.FC<{ onBack: () => void, onNavigate: (pageId: string) => void }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default';
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const cardBorderColor = isDefaultTheme 
      ? '#000000' 
      : (isBlackTheme 
          ? '#FFFFFF' 
          : (theme.palette?.[0] || theme.accent || '#000000'));

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

    const [toastMessage, setToastMessage] = useState('');
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('voice-control');
        if (!getGuideSeen('voice_control_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);

    const handleToggleVoiceControl = () => {
        if (!isEnabled) {
            if (!navigator.onLine) {
                setToastMessage(isEn ? 'No internet connection for voice control. Please check your network.' : 'لا يتوفر إنترنت لتشغيل التحكم الصوتي. يرجى التحقق من اتصالك.');
            } else {
                setToastMessage(isEn ? 'Voice control activated successfully.' : 'تم تفعيل التحكم الصوتي بنجاح.');
            }
        } else {
            setToastMessage(isEn ? 'Voice control disabled.' : 'تم تعطيل التحكم الصوتي.');
        }
        
        setTimeout(() => setToastMessage(''), 3000);
        setIsEnabled(!isEnabled);
    };

    return (
        <div className="h-screen flex flex-col bg-transparent overflow-hidden" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
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

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Voice Control' : 'التحكم الصوتي'}
                            </h1>
                        </div>

                        {/* Home / Lock / Help */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Voice Control Guide" : "دليل التحكم الصوتي"}
                                aria-label={isEn ? "Voice Control Guide" : "دليل التحكم الصوتي"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
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

            <main className={`w-full flex-1 flex flex-col items-center overflow-hidden px-4 pt-2 pb-4 ${isEn ? 'text-left' : 'text-right'}`}>
                <div className="w-full max-w-lg flex-1 overflow-y-auto hide-scrollbar pb-6 space-y-6">
                    {/* Merged Status & Settings Section */}
                    <div 
                        className="themed-card p-4 rounded-2xl space-y-4 relative border"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
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
                                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all cursor-pointer ${isEnabled && isListening ? 'animate-pulse' : ''}`}
                                style={{ 
                                    backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                    color: '#ffffff'
                                }}
                            >
                                {isEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                            </motion.button>
                            <div className="text-center">
                                <p className="text-base font-bold">
                                    {isEnabled ? (isListening ? (isEn ? 'Listening...' : 'جاري الاستماع...') : (isEn ? 'Voice Control Enabled' : 'التحكم الصوتي مفعل')) : (isEn ? 'Voice Control Disabled' : 'التحكم الصوتي معطل')}
                                </p>
                                <p className="text-[10px] opacity-60 mt-0.5">
                                    {isEnabled ? (isEn ? 'You can speak commands from anywhere in the app' : 'يمكنك التحدث بالأوامر من أي مكان في التطبيق') : (isEn ? 'Tap the button to enable continuous listening' : 'اضغط على الزر لتفعيل الاستماع الدائم')}
                                </p>
                            </div>
                            
                            {transcript && isListening && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-xl bg-black/5 w-full text-center italic font-bold text-base border"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    "{transcript}"
                                </motion.div>
                            )}
                        </div>

                        <div className="h-px w-full" style={{ backgroundColor: cardBorderColor, opacity: 0.2 }}></div>

                        {/* Toggle Section */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">{isEn ? 'Voice Control Icon' : 'أيقونة التحكم الصوتي'}</h3>
                                <p className="text-[10px] opacity-60 mt-0.5">{isEn ? 'Show voice control icon on home screen' : 'إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية'}</p>
                            </div>
                            <button 
                                onClick={() => setShowVoiceIcon(!showVoiceIcon)}
                                className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                style={{ backgroundColor: showVoiceIcon ? (themeKey === 'default' ? '#000000' : theme.palette[0]) : '#9ca3af' }}
                            >
                                <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${showVoiceIcon ? (isEn ? 'translate-x-5' : '-translate-x-5') : (isEn ? 'translate-x-0.5' : '-translate-x-0.5')}`} />
                            </button>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div 
                        id="commands-list-container" 
                        className="themed-card p-6 rounded-2xl space-y-6 border"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <h3 className={`font-bold text-lg flex items-center gap-2 border-b pb-2 ${isEn ? 'flex-row' : 'flex-row'}`} style={{ borderColor: cardBorderColor }}>
                            {isEn ? <ArrowRight className="w-5 h-5 text-primary shrink-0" /> : <ChevronRight className="w-5 h-5 text-primary shrink-0" />}
                            <span>{isEn ? 'Comprehensive Voice Control Guide' : 'دليل التحكم الصوتي الشامل'}</span>
                        </h3>
                        
                        <div className="space-y-6 text-sm opacity-90 leading-relaxed">
                            <section className="space-y-2">
                                <h4 className={`font-bold text-primary flex items-center gap-2 ${isEn ? 'flex-row' : 'flex-row'}`}>
                                    <div className="w-1.5 h-4 bg-primary rounded-full shrink-0"></div>
                                    <span>{isEn ? '1. General Navigation Commands (Work from anywhere):' : '1. أوامر التنقل العامة (تعمل من أي مكان في التطبيق):'}</span>
                                </h4>
                                <ul className={`list-disc space-y-1 text-xs ${isEn ? 'pl-4 list-disc' : 'pr-4 list-disc'}`}>
                                    {isEn ? (
                                        <>
                                            <li>"Home": To return to the main screen.</li>
                                            <li>"Quran" / "Reading Page": To open the Noble Quran.</li>
                                            <li>"Prayer Times": To go to prayer times.</li>
                                            <li>"Qibla": To open Qibla compass.</li>
                                            <li>"Tasbeeh": To open electronic rosary.</li>
                                            <li>"Athkar": To open morning and evening remembrance.</li>
                                            <li>"Prayer Athkar": To open post-prayer remembrance.</li>
                                            <li>"Hisn Almuslim": To open Fortress of the Muslim.</li>
                                            <li>"Calendar": To open Islamic and Gregorian calendar.</li>
                                            <li>"Listen to Quran": To open reciters audio page.</li>
                                            <li>"Settings": To open app settings.</li>
                                            <li>"Themes": To open appearance and color themes.</li>
                                            <li>"Voice Control": To go to voice control settings.</li>
                                            <li>"Supplications": To open supplications page.</li>
                                            <li>"Hajj and Umrah": To open Hajj & Umrah guide.</li>
                                            <li>"Nawawi": To open Al-Nawawi's 40 Hadith.</li>
                                            <li>"Back": To go back to the previous page.</li>
                                            <li>"Exit": To close the app.</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>"الرئيسية": للعودة إلى الشاشة الرئيسية.</li>
                                            <li>"مصحف" / "صفحة القراءة" / "القرآن الكريم": لفتح المصحف الشريف.</li>
                                            <li>"فتح مواقيت الصلاة": للانتقال لصفحة مواقيت الصلاة.</li>
                                            <li>"فتح القبلة": لفتح بوصلة القبلة.</li>
                                            <li>"فتح السبحة": لفتح المسبحة الإلكترونية.</li>
                                            <li>"فتح الأذكار": لفتح أذكار الصباح والمساء.</li>
                                            <li>"فتح حصن المسلم": لفتح كتاب حصن المسلم.</li>
                                            <li>"فتح التقويم": لفتح التقويم الهجري والميلادي.</li>
                                            <li>"فتح الاستماع للقرآن": لفتح صفحة الاستماع لمشاهير القراء.</li>
                                            <li>"فتح الإعدادات": لفتح صفحة إعدادات التطبيق.</li>
                                            <li>"فتح الثيمات": لفتح قائمة تغيير ألوان ومظهر التطبيق.</li>
                                            <li>"فتح التحكم الصوتي": للانتقال لإعدادات التحكم الصوتي.</li>
                                            <li>"فتح الأربعون النووية": لفتح صفحة الأربعون النووية.</li>
                                            <li>"رجوع": للعودة الى الصفحه السابقة.</li>
                                            <li>"خروج": لإغلاق التطبيق.</li>
                                        </>
                                    )}
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className={`font-bold text-primary flex items-center gap-2 ${isEn ? 'flex-row' : 'flex-row'}`}>
                                    <div className="w-1.5 h-4 bg-primary rounded-full shrink-0"></div>
                                    <span>{isEn ? '2. Smart Navigation in Quran Reader:' : '2. التنقل الذكي في المصحف:'}</span>
                                </h4>
                                <p className={isEn ? 'pl-4' : 'pr-4'}>
                                    {isEn 
                                        ? 'The system understands context; if you are reading and say a verse number, it navigates accordingly. You can also use:' 
                                        : 'النظام يفهم السياق؛ إذا كنت تقرأ في المصحف ونطقت رقماً فقط، سينتقل بك إلى الآية. كما يمكنك استخدام:'}
                                </p>
                                <ul className={`list-disc space-y-1 text-xs ${isEn ? 'pl-6 list-disc' : 'pr-6 list-disc'}`}>
                                    {isEn ? (
                                        <>
                                            <li>"Surah [Name]" to jump to the start of a Surah.</li>
                                            <li>"Page [Number]" to jump to a specific page.</li>
                                            <li>"Juz [Number]" to jump to a specific Juz.</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>"سورة [اسم السورة]" للانتقال لبداية السورة.</li>
                                            <li>"صفحة [رقم]" للانتقال لصفحة محددة.</li>
                                            <li>"جزء [رقم]" للانتقال لبداية الجزء.</li>
                                        </>
                                    )}
                                </ul>
                            </section>

                            <section className="space-y-2">
                                <h4 className={`font-bold text-primary flex items-center gap-2 ${isEn ? 'flex-row' : 'flex-row'}`}>
                                    <div className="w-1.5 h-4 bg-primary rounded-full shrink-0"></div>
                                    <span>{isEn ? '3. Reading & Appearance Controls:' : '3. أوامر التحكم في صفحة القراءة والمظهر:'}</span>
                                </h4>
                                <ul className={`list-disc space-y-1 text-xs ${isEn ? 'pl-4 list-disc' : 'pr-4 list-disc'}`}>
                                    {isEn ? (
                                        <>
                                            <li>"Zoom in" / "Larger font": To increase font size.</li>
                                            <li>"Zoom out" / "Smaller font": To decrease font size.</li>
                                            <li>"Play audio": To start Quran recitation.</li>
                                            <li>"Stop audio": To stop recitation.</li>
                                            <li>"Show tafseer": To open verse commentary.</li>
                                            <li>"Open bookmarks": To view saved bookmarks.</li>
                                            <li>"Auto scroll": To toggle auto scrolling.</li>
                                            <li>"Open search": To search the Quran.</li>
                                            <li>"Close menu": To close any active menu.</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>"تكبير الخط": لزيادة حجم خط القراءة.</li>
                                            <li>"تصغير الخط": لتقليل حجم خط القراءة.</li>
                                            <li>"تشغيل الصوت": لبدء تلاوة الآيات في الصفحة الحالية.</li>
                                            <li>"إيقاف الصوت": لإيقاف التلاوة.</li>
                                            <li>"عرض التفسير": لفتح نافذة التفسير للآيات.</li>
                                            <li>"فتح العلامات": لفتح قائمة الإشارات المرجعية المحفوظة.</li>
                                            <li>"تشغيل التمرير التلقائي": لتفعيل التمرير التلقائي.</li>
                                            <li>"فتح البحث": لفتح محرك البحث في القرآن.</li>
                                            <li>"إغلاق القائمة": لإغلاق أي قائمة مفتوحة.</li>
                                        </>
                                    )}
                                </ul>
                            </section>

                            <div 
                                className="p-4 rounded-xl bg-black/5 dark:bg-white/5 border text-xs italic"
                                style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                            >
                                {isEn 
                                    ? '* Tip: The voice recognition system is intelligent and understands natural voice commands accurately.' 
                                    : '* نصيحة: النظام ذكي بما يكفي ليفهم الأوامر الصوتية الطبيعية بدقة عالية.'}
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 w-full h-4"></div>
                </div>
            </main>
            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('voice-control');
                }}
                steps={VOICE_CONTROL_PAGE_STEPS}
                guideKey="voice_control_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
};

export default VoiceControlPage;
