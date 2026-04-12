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

            <main className="flex-1 overflow-y-auto p-4 space-y-2">
                <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 mb-4">
                    <p className="text-sm text-center font-bold text-emerald-600 dark:text-emerald-400">
                        يمكنك نطق اسم السورة لتحميلها أو حذفها من جهازك
                    </p>
                </div>

                {SURAH_LIST.map(surah => (
                    <div 
                        key={surah.number}
                        onClick={() => toggleDownload(surah.number)}
                        className={`p-4 rounded-xl border flex justify-between items-center transition-all active:scale-[0.98] ${
                            downloadedSurahs.includes(surah.number) 
                                ? 'border-emerald-500 bg-emerald-500/10' 
                                : 'border-gray-200 dark:border-gray-800 bg-white/5'
                        }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="opacity-50 font-mono w-8">{toArabic(surah.number)}</span>
                            <span className="font-bold text-lg">{surah.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {downloadedSurahs.includes(surah.number) ? (
                                <>
                                    <span className="text-xs font-bold text-emerald-600">تم التحميل</span>
                                    <i className="fa-solid fa-circle-check text-emerald-500"></i>
                                </>
                            ) : (
                                <i className="fa-solid fa-cloud-arrow-down opacity-30"></i>
                            )}
                        </div>
                    </div>
                ))}
            </main>

            <BottomBar onHomeClick={onNavigate ? () => onNavigate('home') : onBack} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default QuranDownload;
