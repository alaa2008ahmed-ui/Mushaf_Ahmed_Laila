import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useVoiceControl } from '../context/VoiceControlContext';
import { Mic, MicOff, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import ThemePageLock from '../components/ThemePageLock';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { VOICE_CONTROL_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

const VoiceControlPage: React.FC<{ onBack: () => void, onNavigate: (pageId: string) => void }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const tokens = getModernFlatTokens(theme, themeKey);

    const { 
        isEnabled, 
<<<<<<< HEAD
=======
        setIsEnabled, 
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
        toggleEnabled,
        isListening, 
        transcript, 
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
        toggleEnabled();
    };

    const accentColor = tokens.isDeepBlack ? '#FFFFFF' : tokens.primaryColor;

    return (
<<<<<<< HEAD
        <div
            className="h-[100dvh] flex flex-col overflow-hidden"
            style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }}
            dir={isEn ? 'ltr' : 'rtl'}
        >
            <header className="app-top-bar" dir={isEn ? 'ltr' : 'rtl'}>
=======
        <div className="h-[100dvh] flex flex-col bg-transparent overflow-hidden" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar">
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
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
                                <i className="fa-solid fa-circle-question text-lg"></i>
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

<<<<<<< HEAD
            <main className={`w-full flex-1 min-h-0 flex flex-col items-center overflow-hidden px-4 ${isEn ? 'text-left' : 'text-right'}`}>
                <div className="w-full max-w-xl flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-2 pb-6 app-scroll-safe space-y-4">
                    {/* Hero Mic Status Card */}
                    <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-4 relative overflow-visible">
=======
            <main className={`w-full flex-1 min-h-0 flex flex-col items-center overflow-hidden px-4 pt-2 ${isEn ? 'text-left' : 'text-right'}`}>
                <div className="w-full max-w-lg flex-1 min-h-0 overflow-y-auto hide-scrollbar app-scroll-safe space-y-6">
                    {/* Merged Status & Settings Section */}
                    <div 
                        className="themed-card app-page-card p-4 rounded-2xl space-y-4 relative border-0"
                        style={{ border: 'none' }}
                    >
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                        {toastMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                className="app-page-card border-0 absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full z-50 whitespace-nowrap"
                            >
                                {toastMessage}
                            </motion.div>
                        )}

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
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-3.5 rounded-2xl w-full text-center italic font-bold text-base"
                                    style={{ color: accentColor }}
                                >
                                    "{transcript}"
                                </motion.div>
                            )}
                        </div>
                    </div>

<<<<<<< HEAD
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleVoiceControl();
                                }}
                                className="app-page-card border-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0"
                                style={{ backgroundColor: isEnabled ? '#10b981' : '#9ca3af' }}
                                title={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                                aria-label={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        isEnabled ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')
                                    }`}
                                />
                            </button>
                        </div>

                        {/* Home Screen Icon Visibility Toggle */}
                        <div
                            onClick={() => setShowVoiceIcon(!showVoiceIcon)}
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
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowVoiceIcon(!showVoiceIcon);
                                }}
                                className="app-page-card border-0 relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none cursor-pointer shrink-0"
                                style={{ backgroundColor: showVoiceIcon ? (tokens.isDeepBlack ? '#475569' : tokens.primaryColor) : '#9ca3af' }}
                                title={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                                aria-label={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                            >
                                <span
                                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                                        showVoiceIcon ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')
                                    }`}
                                />
=======
                        <div className="h-px w-full" style={{ backgroundColor: cardBorderColor, opacity: 0.2 }}></div>

                        {/* Activation Toggle linked with Home Screen Icon */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">{isEn ? 'Voice Control Activation' : 'تفعيل التحكم الصوتي'}</h3>
                                <p className="text-[10px] opacity-60 mt-0.5">
                                    {isEnabled 
                                        ? (isEn ? 'Enabled & synced with home screen button' : 'مفعّل ومرتبط بزر الصفحة الرئيسية') 
                                        : (isEn ? 'Disabled on home screen and all pages' : 'معطّل بالصفحة الرئيسية وكافة الصفحات')}
                                </p>
                            </div>
                            <button 
                                id="voice-activation-toggle"
                                type="button"
                                onClick={handleToggleVoiceControl}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                style={{ backgroundColor: isEnabled ? '#10b981' : '#9ca3af' }}
                                title={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                                aria-label={isEnabled ? (isEn ? 'Disable voice control' : 'تعطيل التحكم الصوتي') : (isEn ? 'Enable voice control' : 'تفعيل التحكم الصوتي')}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${isEnabled ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')}`} />
                            </button>
                        </div>

                        <div className="h-px w-full" style={{ backgroundColor: cardBorderColor, opacity: 0.2 }}></div>

                        {/* Home Screen Icon Visibility Toggle */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-bold text-sm">{isEn ? 'Voice Control Icon' : 'أيقونة التحكم الصوتي'}</h3>
                                <p className="text-[10px] opacity-60 mt-0.5">{isEn ? 'Show voice control icon on home screen' : 'إظهار أيقونة التحكم الصوتي في الصفحة الرئيسية'}</p>
                            </div>
                            <button 
                                id="voice-show-icon-toggle"
                                type="button"
                                onClick={() => setShowVoiceIcon(!showVoiceIcon)}
                                className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer"
                                style={{ backgroundColor: showVoiceIcon ? (themeKey === 'default' ? '#000000' : theme.palette[0]) : '#9ca3af' }}
                                title={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                                aria-label={showVoiceIcon ? (isEn ? 'Hide icon' : 'إخفاء الأيقونة') : (isEn ? 'Show icon' : 'إظهار الأيقونة')}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${showVoiceIcon ? (isEn ? 'translate-x-6' : '-translate-x-6') : (isEn ? 'translate-x-1' : '-translate-x-1')}`} />
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            </button>
                        </div>
                    </div>

                    {/* Instructions Section */}
<<<<<<< HEAD
                    <div id="commands-list-container" className="space-y-3.5 overflow-visible">
                        {/* Guide Title Card */}
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] px-5 py-3.5 rounded-[18px] flex items-center gap-2.5 overflow-visible">
                            <span
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                style={{
                                    backgroundColor: hexToRgba(tokens.primaryColor, tokens.isDeepBlack ? 0.2 : 0.12),
                                    color: accentColor
                                }}
=======
                    <div 
                        id="commands-list-container" 
                        className="themed-card app-page-card p-6 rounded-2xl space-y-6 border-0"
                        style={{ border: 'none' }}
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
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682
                            >
                                {isEn ? <ArrowRight className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </span>
                            <h3 className="font-bold text-base sm:text-lg" style={{ color: 'var(--text-color)' }}>
                                {isEn ? 'Comprehensive Voice Control Guide' : 'دليل التحكم الصوتي الشامل'}
                            </h3>
                        </div>

                        {/* Section 1 Card */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-3 overflow-visible">
                            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: accentColor }}>
                                <span
                                    className="w-1.5 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span>{isEn ? '1. General Navigation Commands (Work from anywhere):' : '1. أوامر التنقل العامة (تعمل من أي مكان في التطبيق):'}</span>
                            </h4>
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

                        {/* Section 2 Card */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-3 overflow-visible">
                            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: accentColor }}>
                                <span
                                    className="w-1.5 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span>{isEn ? '2. Smart Navigation in Quran Reader:' : '2. التنقل الذكي في المصحف:'}</span>
                            </h4>
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
                        </section>

                        {/* Section 3 Card */}
                        <section className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] space-y-3 overflow-visible">
                            <h4 className="font-bold text-sm sm:text-base flex items-center gap-2" style={{ color: accentColor }}>
                                <span
                                    className="w-1.5 h-4 rounded-full shrink-0"
                                    style={{ backgroundColor: accentColor }}
                                />
                                <span>{isEn ? '3. Reading & Appearance Controls:' : '3. أوامر التحكم في صفحة القراءة والمظهر:'}</span>
                            </h4>
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
                        </section>

                        {/* Tip Card */}
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-4 rounded-[18px] flex items-center gap-3 text-xs sm:text-sm font-medium overflow-visible">
                            <span
                                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
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
        </div>
    );
};

export default VoiceControlPage;
