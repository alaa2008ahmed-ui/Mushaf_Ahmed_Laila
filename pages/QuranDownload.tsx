import React, { useState, useEffect } from 'react';
import { SURAH_LIST } from '../data/listenQuranData';
import { toArabic } from '../components/QuranReader/constants';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { getCalculator3DStyles } from '../utils/calculator3DStyles';

const QuranDownload: React.FC<{ onBack: () => void, onNavigate?: (pageId: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);

    const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>(() => {
        const saved = localStorage.getItem('downloaded_surahs');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('downloaded_surahs', JSON.stringify(downloadedSurahs));
    }, [downloadedSurahs]);

    const toggleDownload = (surahNumber: number) => {
        setDownloadedSurahs(prev => 
            prev.includes(surahNumber) 
                ? prev.filter(n => n !== surahNumber) 
                : [...prev, surahNumber]
        );
    };

    useEffect(() => {
        const handleVoiceCommand = (e: any) => {
            const { action, params } = e.detail;
            if (action === 'toggle_download' && params?.surah) {
                toggleDownload(params.surah);
            }
        };
        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, []);

    return (
<<<<<<< HEAD
        <div
            className="h-[100dvh] flex flex-col overflow-hidden font-cairo"
            dir={isEn ? 'ltr' : 'rtl'}
            style={{ backgroundColor: s3d.pageBgColor, color: s3d.textColor }}
        >
            <header className="app-top-bar shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? 'Back' : 'رجوع'}
                                aria-label={isEn ? 'Back' : 'رجوع'}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? 'Downloads' : 'التحميل'}
                            </h1>
                        </div>

                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <ThemePageLock />
                            <button
                                onClick={() => (onNavigate ? onNavigate('home') : onBack())}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? 'Home' : 'الصفحة الرئيسية'}
                                aria-label={isEn ? 'Home' : 'الصفحة الرئيسية'}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-3 space-y-3 app-scroll-safe">
                <div className="max-w-3xl mx-auto w-full space-y-3 overflow-visible">
                    <div className={`app-page-card border-0 p-4 rounded-2xl flex items-center justify-center gap-3 ${s3d.surfaceCardClass}`}>
                        <span
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }}
                        >
                            <i className="fa-solid fa-microphone text-sm"></i>
                        </span>
                        <p className="text-xs sm:text-sm font-bold leading-relaxed" style={{ color: s3d.noticeAccent }}>
                            {isEn
                                ? 'Speak a surah name to download or remove it from your device'
                                : 'يمكنك نطق اسم السورة لتحميلها أو حذفها من جهازك'}
                        </p>
                    </div>
=======
        <div className="h-[100dvh] flex flex-col overflow-hidden font-cairo" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
            <header className="p-4 shadow-md theme-header-bg flex items-center justify-center shrink-0">
                <h1 className="text-xl font-bold font-kufi">التحميل</h1>
            </header>

            <main className="flex-1 min-h-0 overflow-y-auto px-4 pt-2 space-y-2 app-scroll-safe">
                <div className="p-4 rounded-xl border mb-4" style={{ backgroundColor: `${theme.accent}15`, borderColor: `${theme.accent}30` }}>
                    <p className="text-sm text-center font-bold" style={{ color: theme.accent }}>
                        يمكنك نطق اسم السورة لتحميلها أو حذفها من جهازك
                    </p>
                </div>

                {SURAH_LIST.map(surah => {
                    const isDownloaded = downloadedSurahs.includes(surah.number);
                    return (
                        <div 
                            key={surah.number}
                            onClick={() => toggleDownload(surah.number)}
                            className={`p-4 rounded-xl border flex justify-between items-center transition-all active:scale-[0.98] cursor-pointer`}
                            style={{ 
                                borderColor: isDownloaded ? theme.accent : (theme.cardBorder || `${theme.textColor}20`),
                                backgroundColor: isDownloaded ? `${theme.accent}15` : (theme.cardBg || `${theme.textColor}05`),
                                color: theme.textColor
                            }}
                        >
                            <div className="flex items-center gap-4">
                                <span className="opacity-50 font-mono w-8" style={{ color: theme.textColor }}>{toArabic(surah.number)}</span>
                                <span className="font-bold text-lg">{surah.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {isDownloaded ? (
                                    <>
                                        <span className="text-xs font-bold" style={{ color: theme.accent }}>تم التحميل</span>
                                        <i className="fa-solid fa-circle-check" style={{ color: theme.accent }}></i>
                                    </>
                                ) : (
                                    <i className="fa-solid fa-cloud-arrow-down opacity-30"></i>
                                )}
                            </div>
                        </div>
                    );
                })}
            </main>
>>>>>>> 590412898dc80b59e51feb5ab916e5ce21e97682

                    {SURAH_LIST.map(surah => {
                        const isDownloaded = downloadedSurahs.includes(surah.number);
                        return (
                            <div 
                                key={surah.number}
                                data-card-item="true"
                                onClick={() => toggleDownload(surah.number)}
                                className={`app-page-card tasbeeh-pressable border-0 p-4 rounded-2xl flex justify-between items-center cursor-pointer overflow-visible ${s3d.surfaceCardClass}`}
                                style={isDownloaded ? { backgroundColor: s3d.activeTintBg } : undefined}
                            >
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <span
                                        className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0"
                                        style={
                                            isDownloaded
                                                ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }
                                                : { backgroundColor: s3d.softResultBg, color: s3d.noticeAccent }
                                        }
                                    >
                                        {isEn ? surah.number : toArabic(surah.number)}
                                    </span>
                                    <span className="font-bold text-base sm:text-lg truncate">{surah.name}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {isDownloaded ? (
                                        <span
                                            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                                            style={{ backgroundColor: s3d.primaryColor, color: s3d.btnTextColor }}
                                        >
                                            <span>{isEn ? 'Downloaded' : 'تم التحميل'}</span>
                                            <i className="fa-solid fa-circle-check"></i>
                                        </span>
                                    ) : (
                                        <span
                                            className="w-9 h-9 rounded-xl flex items-center justify-center"
                                            style={{ backgroundColor: s3d.isBlackTheme ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.05)' }}
                                        >
                                            <i className="fa-solid fa-cloud-arrow-down opacity-55"></i>
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default QuranDownload;
