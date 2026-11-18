import React, { useState, useEffect, useRef } from 'react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { Mic, MicOff, ChevronDown, Sparkles, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { VOICE_CONTROL_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

const VoiceControlPage: React.FC<{ onBack: () => void, onNavigate: (pageId: string) => void }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const tokens = getModernFlatTokens(theme, themeKey);
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);

    const { 
        isEnabled, 
        toggleEnabled,
        isListening, 
        transcript, 
        showVoiceIcon,
        setShowVoiceIcon
    } = useVoiceControl();

    const [toastMessage, setToastMessage] = useState('');
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [openCommandSection, setOpenCommandSection] = useState<'general' | 'quran' | 'appearance' | null>(null);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        toastTimerRef.current = setTimeout(() => {
            setToastMessage('');
            toastTimerRef.current = null;
        }, 3000);
    };

    useEffect(() => {
        markPageAsSeen('voice-control');
        if (!getGuideSeen('voice_control_page_spotlight')) {
            setShowGuide(true);
        }
        return () => {
            if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        };
    }, []);

    const handleToggleVoiceControl = () => {
        if (!isEnabled) {
            if (!navigator.onLine) {
                showToast(isEn ? 'No internet connection for voice control. Please check your network.' : 'لا يتوفر إنترنت لتشغيل التحكم الصوتي. يرجى التحقق من اتصالك.');
            } else {
                showToast(isEn ? 'Voice control activated successfully.' : 'تم تفعيل التحكم الصوتي بنجاح.');
            }
        } else {
            showToast(isEn ? 'Voice control disabled.' : 'تم تعطيل التحكم الصوتي.');
        }

        toggleEnabled();
    };

    const handleToggleVoiceIcon = () => {
        const nextShow = !showVoiceIcon;
        setShowVoiceIcon(nextShow);
        showToast(
            nextShow
                ? (isEn ? 'Voice control icon shown on home screen.' : 'تم إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية.')
                : (isEn ? 'Voice control icon hidden from home screen.' : 'تم إخفاء أيقونة التحكم الصوتي من الصفحة الرئيسية.')
        );
    };

    const toggleCommandSection = (sectionId: 'general' | 'quran' | 'appearance') => {
        setOpenCommandSection(prev => (prev === sectionId ? null : sectionId));
    };

    const accentColor = tokens.isDeepBlack ? '#FFFFFF' : tokens.primaryColor;

    return (
        <div
            className="h-[100dvh] flex flex-col overflow-hidden"
            style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
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
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-cairo truncate">
                                {isEn ? 'Voice Control' : 'التحكم الصوتي'}
                            </h1>
                        </div>

                        {/* Home / Help */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Voice Control Guide" : "دليل التحكم الصوتي"}
                                aria-label={isEn ? "Voice Control Guide" : "دليل التحكم الصوتي"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
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

            <main className={`w-full flex-1 min-h-0 flex flex-col items-center overflow-hidden px-4 ${isEn ? 'text-left' : 'text-right'}`}>
                <div className="w-full max-w-xl flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-2 pb-6 app-scroll-safe space-y-4">
                    {/* Hero Mic Status Card */}
                    <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-4 relative overflow-visible">

                        <div className="flex flex-col items-center justify-center space-y-3 py-1">
                            <button
                                id="voice-toggle-btn"
                                type="button"
                                onClick={handleToggleVoiceControl}
                                className={`app-page-card border-0 w-16 h-16 rounded-full flex items-center justify-center transition-all cursor-pointer ${isEnabled && isListening ? 'animate-pulse' : ''}`}
                                style={{
                                    backgroundColor: isEnabled ? (isListening ? '#ef4444' : '#10b981') : '#9ca3af',
                                    color: '#ffffff'
                                }}
                                aria-label={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                            >
                                {isEnabled ? <Mic className="w-8 h-8" /> : <MicOff className="w-8 h-8" />}
                            </button>

                            <div className="text-center">
                                <p className="text-base font-bold" style={{ color: 'var(--text-color)' }}>
                                    {isEnabled ? (isListening ? (isEn ? 'Listening...' : 'جاري الاستماع...') : (isEn ? 'Voice Control Enabled' : 'التحكم الصوتي مفعل')) : (isEn ? 'Voice Control Disabled' : 'التحكم الصوتي معطل')}
                                </p>
                                <p className="text-xs opacity-70 mt-1" style={{ color: tokens.subtextColor }}>
                                    {isEnabled ? (isEn ? 'You can speak commands from anywhere in the app' : 'يمكنك التحدث بالأوامر من أي مكان في التطبيق') : (isEn ? 'Tap the button to enable continuous listening' : 'اضغط على الزر لتفعيل الاستماع الدائم')}
                                </p>
                            </div>

                            {transcript && isListening && (
                                <div
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-2xl w-full text-center italic font-bold text-base"
                                    style={{ color: accentColor }}
                                >
                                    "{transcript}"
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Settings Toggle Cards */}
                    <div className="space-y-3 overflow-visible">
                        {/* Activation Toggle linked with Home Screen Icon */}
                        <div
                            onClick={handleToggleVoiceControl}
                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] flex items-center justify-between gap-3 cursor-pointer overflow-visible"
                        >
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                    {isEn ? 'Voice Control Activation' : 'تفعيل التحكم الصوتي'}
                                </h3>
                                <p className="text-[11px] mt-0.5" style={{ color: tokens.subtextColor }}>
                                    {isEnabled
                                        ? (isEn ? 'Enabled & synced with home screen button' : 'مفعّل ومرتبط بزر الصفحة الرئيسية')
                                        : (isEn ? 'Disabled on home screen and all pages' : 'معطّل بالصفحة الرئيسية وكافة الصفحات')}
                                </p>
                            </div>
                            <button
                                id="voice-activation-toggle"
                                type="button"
                                role="switch"
                                aria-checked={isEnabled}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleVoiceControl();
                                }}
                                className="app-3d-switch-track border-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0"
                                style={{ backgroundColor: isEnabled ? '#10b981' : '#9ca3af' }}
                                title={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                                aria-label={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                            >
                                <span
                                    className={`app-3d-switch-thumb inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        isEnabled ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Home Screen Icon Visibility Toggle */}
                        <div
                            onClick={handleToggleVoiceIcon}
                            className="app-page-card tasbeeh-pressable border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] flex items-center justify-between gap-3 cursor-pointer overflow-visible"
                        >
                            <div className="min-w-0">
                                <h3 className="font-bold text-sm" style={{ color: 'var(--text-color)' }}>
                                    {isEn ? 'Voice Control Icon' : 'أيقونة التحكم الصوتي'}
                                </h3>
                                <p className="text-[11px] mt-0.5" style={{ color: tokens.subtextColor }}>
                                    {isEn ? 'Show voice control icon on home screen' : 'إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية'}
                                </p>
                            </div>
                            <button
                                id="voice-show-icon-toggle"
                                type="button"
                                role="switch"
                                aria-checked={showVoiceIcon}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleVoiceIcon();
                                }}
                                className="app-3d-switch-track border-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0"
                                style={{ backgroundColor: showVoiceIcon ? (tokens.isDeepBlack ? '#475569' : tokens.primaryColor) : '#9ca3af' }}
                                title={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                                aria-label={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                            >
                                <span
                                    className={`app-3d-switch-thumb inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        showVoiceIcon ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')
                                    }`}
                                />
                            </button>
                        </div>
                    </div>

                    {/* Instructions Section */}
                    <div id="commands-list-container" className="space-y-3.5 overflow-visible">
                        {/* Section 1 Card (Accordion) */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] overflow-visible">
                            <button
                                type="button"
                                onClick={() => toggleCommandSection('general')}
                                aria-expanded={openCommandSection === 'general'}
                                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none text-start"
                            >
                                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 min-w-0" style={{ color: accentColor }}>
                                    <span
                                        className="app-3d-badge w-1.5 h-4 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: accentColor,
                                            backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.22) 100%)'
                                        }}
                                    />
                                    <span className="leading-snug">{isEn ? '1. General Navigation Commands (Work from anywhere):' : '1. أوامر التنقل العامة (تعمل من أي مكان في التطبيق):'}</span>
                                </h4>
                                <ChevronDown
                                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openCommandSection === 'general' ? 'rotate-180' : ''}`}
                                    style={{ color: accentColor }}
                                />
                            </button>
                            {openCommandSection === 'general' && (
                                <div className="px-5 pb-5 pt-3 border-t border-black/5 dark:border-white/10 overflow-hidden rounded-b-[18px]">
                                    <ul className={`list-disc space-y-1.5 text-xs sm:text-sm leading-relaxed ${isEn ? 'pl-5' : 'pr-5'}`} style={{ color: 'var(--text-color)' }}>
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
                                                <li>"فتح التحكم الصوتي": للانتقال لإعدادات التحكم الصوتي.</li>
                                                <li>"فتح الأربعون النووية": لفتح صفحة الأربعون النووية.</li>
                                                <li>"رجوع": للعودة الى الصفحه السابقة.</li>
                                                <li>"خروج": لإغلاق التطبيق.</li>
                                            </>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </section>

                        {/* Section 2 Card (Accordion) */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] overflow-visible">
                            <button
                                type="button"
                                onClick={() => toggleCommandSection('quran')}
                                aria-expanded={openCommandSection === 'quran'}
                                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none text-start"
                            >
                                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 min-w-0" style={{ color: accentColor }}>
                                    <span
                                        className="app-3d-badge w-1.5 h-4 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: accentColor,
                                            backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.22) 100%)'
                                        }}
                                    />
                                    <span className="leading-snug">{isEn ? '2. Smart Navigation in Quran Reader:' : '2. التنقل الذكي في المصحف:'}</span>
                                </h4>
                                <ChevronDown
                                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openCommandSection === 'quran' ? 'rotate-180' : ''}`}
                                    style={{ color: accentColor }}
                                />
                            </button>
                            {openCommandSection === 'quran' && (
                                <div className="px-5 pb-5 pt-3 space-y-3 border-t border-black/5 dark:border-white/10 overflow-hidden rounded-b-[18px]">
                                    <p className={`text-xs sm:text-sm leading-relaxed opacity-90 ${isEn ? 'pl-3.5' : 'pr-3.5'}`} style={{ color: 'var(--text-color)' }}>
                                        {isEn
                                            ? 'The system understands context; if you are reading and say a verse number, it navigates accordingly. You can also use:'
                                            : 'النظام يفهم السياق؛ إذا كنت تقرأ في المصحف ونطقت رقماً فقط، سينتقل بك إلى الآية. كما يمكنك استخدام:'}
                                    </p>
                                    <ul className={`list-disc space-y-1.5 text-xs sm:text-sm leading-relaxed ${isEn ? 'pl-6' : 'pr-6'}`} style={{ color: 'var(--text-color)' }}>
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
                                </div>
                            )}
                        </section>

                        {/* Section 3 Card (Accordion) */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] overflow-visible">
                            <button
                                type="button"
                                onClick={() => toggleCommandSection('appearance')}
                                aria-expanded={openCommandSection === 'appearance'}
                                className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none text-start"
                            >
                                <h4 className="font-bold text-sm sm:text-base flex items-center gap-2 min-w-0" style={{ color: accentColor }}>
                                    <span
                                        className="app-3d-badge w-1.5 h-4 rounded-full shrink-0"
                                        style={{
                                            backgroundColor: accentColor,
                                            backgroundImage: 'linear-gradient(180deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0) 45%, rgba(0, 0, 0, 0.22) 100%)'
                                        }}
                                    />
                                    <span className="leading-snug">{isEn ? '3. Reading & Appearance Controls:' : '3. أوامر التحكم في صفحة القراءة والمظهر:'}</span>
                                </h4>
                                <ChevronDown
                                    className={`w-5 h-5 shrink-0 transition-transform duration-200 ${openCommandSection === 'appearance' ? 'rotate-180' : ''}`}
                                    style={{ color: accentColor }}
                                />
                            </button>
                            {openCommandSection === 'appearance' && (
                                <div className="px-5 pb-5 pt-3 border-t border-black/5 dark:border-white/10 overflow-hidden rounded-b-[18px]">
                                    <ul className={`list-disc space-y-1.5 text-xs sm:text-sm leading-relaxed ${isEn ? 'pl-5' : 'pr-5'}`} style={{ color: 'var(--text-color)' }}>
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
                                </div>
                            )}
                        </section>

                        {/* Tip Card */}
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] flex items-center gap-3 text-xs sm:text-sm font-medium overflow-visible">
                            <span
                                className="app-3d-badge w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    backgroundColor: hexToRgba(tokens.primaryColor, tokens.isDeepBlack ? 0.2 : 0.12),
                                    color: accentColor
                                }}
                            >
                                <Sparkles className="w-4 h-4" />
                            </span>
                            <p className="leading-relaxed italic opacity-90" style={{ color: 'var(--text-color)' }}>
                                {isEn
                                    ? 'Tip: The voice recognition system is intelligent and understands natural voice commands accurately.'
                                    : 'نصيحة: النظام ذكي بما يكفي ليفهم الأوامر الصوتية الطبيعية بدقة عالية.'}
                            </p>
                        </div>
                    </div>
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

            {toastMessage && (
                <div
                    className="app-3d-toast border-0 fixed left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words pointer-events-none flex items-center justify-center gap-2.5"
                    style={{
                        bottom: 'calc(var(--app-bottom-clearance, 0px) + clamp(1.25rem, 3dvh, 2rem))',
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
        </div>
    );
};

export default VoiceControlPage;
