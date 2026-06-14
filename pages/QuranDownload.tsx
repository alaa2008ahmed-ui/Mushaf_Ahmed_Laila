import React, { useState, useEffect } from 'react';
import { SURAH_LIST } from '../data/listenQuranData';
import { toArabic } from '../components/QuranReader/constants';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';

const QuranDownload: React.FC<{ onBack: () => void, onNavigate?: (pageId: string, params?: any) => void }> = ({ onBack, onNavigate }) => {
    const { theme } = useTheme();
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
        <div className="min-h-screen flex flex-col font-cairo" style={{ backgroundColor: theme.bgColor, color: theme.textColor }}>
            <header className="p-4 shadow-md theme-header-bg flex items-center gap-4">
                <button onClick={onBack} className="text-2xl">
                    <i className="fa-solid fa-arrow-right"></i>
                </button>
                <h1 className="text-xl font-bold">تحميل سور القرآن</h1>
            </header>

            <main className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
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
                <div className="shrink-0 w-full h-32"></div>
            </main>

            <BottomBar onHomeClick={onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default QuranDownload;
