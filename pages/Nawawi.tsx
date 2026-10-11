import React, { useState, useEffect } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import { NAWAWI_EXPLANATIONS, HadithExplanation } from '../data/nawawiExplanationData';
import BottomBar from '../components/BottomBar';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { 
    BookOpen, Sparkles, Lightbulb, Scale, ShieldCheck, 
    HeartHandshake, Copy, Share2, Volume2, ZoomIn, 
    X, Check, ArrowRight, ArrowLeft 
} from 'lucide-react';

interface HadithModalProps {
    hadith: typeof NAWAWI_DATA[0];
    initialTab?: 'hadith' | 'explanation';
    onClose: () => void;
    favorites: number[];
    toggleFavorite: (id: number, e: React.MouseEvent) => void;
    handleCopy: (text: string, e: React.MouseEvent) => void;
    handleShare: (hadith: any, e: React.MouseEvent) => void;
    setToastMessage: (msg: string) => void;
}

const HadithModal: React.FC<HadithModalProps> = ({ 
    hadith, 
    initialTab = 'hadith',
    onClose, 
    favorites, 
    toggleFavorite, 
    handleCopy, 
    handleShare,
    setToastMessage
}) => {
    const { theme, themeKey } = useTheme();
    const [activeTab, setActiveTab] = useState<'hadith' | 'explanation'>(initialTab);
    const [fontSize, setFontSize] = useState(18);
    const [playingText, setPlayingText] = useState<string | null>(null);
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));
    const primaryColor = isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]);
    const primaryTextColor = isBlackTheme ? '#000000' : (isDefaultTheme ? '#000000' : '#FFFFFF');

    const explanation: HadithExplanation | undefined = NAWAWI_EXPLANATIONS[hadith.id];

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isHadithPlaying = playingText === hadith.hadith;
    const isExplanationPlaying = !!(explanation && playingText?.includes(explanation.summary.slice(0, 30)));

    const increaseFontSize = () => {
        setFontSize(prev => (prev >= 32 ? 18 : prev + 4));
    };

    const toArabicDigits = (num: number) => {
        return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    };

    const cleanTitle = (title: string) => {
        if (title.includes(': ')) {
            return title.split(': ')[1];
        }
        return title;
    };

    const handlePlayAudio = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeTab === 'hadith') {
            if (isHadithPlaying) {
                stopTTS();
            } else {
                playTTS(hadith.hadith, { hadithId: hadith.id });
            }
        } else if (explanation) {
            if (isExplanationPlaying) {
                stopTTS();
            } else {
                const combinedExplanationSpeech = `الشرح المختصر: ${explanation.summary}. الفوائد العقدية: ${explanation.creedBenefits.join('. ')}. الفوائد الفقهية: ${explanation.fiqhBenefits.join('. ')}. الفوائد التربوية: ${explanation.valuesBenefits.join('. ')}.`;
                playTTS(combinedExplanationSpeech);
            }
        }
    };

    const handleCopyExplanation = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!explanation) return;
        let text = `📚 ${hadith.title}\n\n`;
        text += `📖 الشرح المختصر:\n${explanation.summary}\n\n`;
        if (explanation.creedBenefits?.length) {
            text += `💎 الفوائد العقدية والإيمانية:\n` + explanation.creedBenefits.map((b, i) => `• ${b}`).join('\n') + `\n\n`;
        }
        if (explanation.fiqhBenefits?.length) {
            text += `⚖️ الفوائد الفقهية والعملية:\n` + explanation.fiqhBenefits.map((b, i) => `• ${b}`).join('\n') + `\n\n`;
        }
        if (explanation.valuesBenefits?.length) {
            text += `🌿 الفوائد التربوية والسلوكية:\n` + explanation.valuesBenefits.map((b, i) => `• ${b}`).join('\n') + `\n\n`;
        }
        text += `— من تطبيق مصحف أحمد وليلى (الأربعون النووية)`;
        handleCopy(text, e);
    };

    const handleShareExplanation = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!explanation) return;
        let text = `📖 الشرح المختصر:\n${explanation.summary}\n\n`;
        text += `💎 الفوائد العقدية والإيمانية:\n` + explanation.creedBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
        text += `⚖️ الفوائد الفقهية والعملية:\n` + explanation.fiqhBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
        text += `🌿 الفوائد التربوية والسلوكية:\n` + explanation.valuesBenefits.map(b => `• ${b}`).join('\n');

        await shareAsImage({
            text,
            source: 'الأربعون النووية - الفوائد والشرح',
            category: hadith.title,
            theme,
            setToastMessage
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="rounded-3xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col scale-in overflow-hidden border" 
                style={{ 
                    backgroundColor: 'var(--modal-bg)', 
                    color: 'var(--modal-text)', 
                    fontFamily: theme.font,
                    borderColor: cardBorderColor,
                    borderWidth: '1.5px',
                    borderStyle: 'solid'
                }} 
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
            >
                {/* Header */}
                <div className="p-4 sm:p-5 border-b flex flex-col gap-3" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex items-center justify-between w-full">
                        <span 
                            className="px-2.5 py-1 rounded-full text-xs font-bold border"
                            style={{ 
                                backgroundColor: isDefaultTheme ? '#00000015' : (theme.palette[0] + '20'),
                                color: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]),
                                borderColor: cardBorderColor,
                                borderWidth: '1.5px',
                                borderStyle: 'solid'
                            }}
                        >
                            الحديث {toArabicDigits(hadith.id)}
                        </span>
                        
                        <h3 className="text-lg sm:text-xl font-bold text-center flex-1 mx-2 truncate" style={{ color: 'var(--modal-text)' }}>
                            {cleanTitle(hadith.title)}
                        </h3>

                        <button 
                            onClick={onClose} 
                            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Segmented Control / Tabs */}
                    <div className="flex p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 gap-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab('hadith')}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                                activeTab === 'hadith' 
                                    ? 'shadow-md scale-[1.01]' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            style={
                                activeTab === 'hadith'
                                    ? { 
                                        backgroundColor: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]),
                                        color: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#000000' : primaryTextColor)
                                      }
                                    : { color: 'var(--modal-text)' }
                            }
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>نص الحديث</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('explanation')}
                            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                                activeTab === 'explanation' 
                                    ? 'shadow-md scale-[1.01]' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            style={
                                activeTab === 'explanation'
                                    ? { 
                                        backgroundColor: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]),
                                        color: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#000000' : primaryTextColor)
                                      }
                                    : { color: 'var(--modal-text)' }
                            }
                        >
                            <Lightbulb className="w-4 h-4" />
                            <span>الفوائد والشرح المختصر</span>
                        </button>
                    </div>
                </div>
                
                {/* Tab 1: Hadith Text */}
                {activeTab === 'hadith' && (
                    <div className="p-6 sm:p-8 overflow-y-auto leading-loose text-center flex-1 hide-scrollbar" style={{ fontSize: `${fontSize}px`, color: 'var(--modal-text)' }}>
                        <p className="whitespace-pre-line font-amiri leading-loose selection:bg-amber-100">
                            {hadith.hadith}
                        </p>

                        {/* Quick Prominent Switcher to Explanation */}
                        <div className="mt-8 pt-4 border-t border-black/5 dark:border-white/5 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setActiveTab('explanation')}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md hover:scale-105 active:scale-95 transition-all border"
                                style={{
                                    backgroundColor: isDefaultTheme ? '#000000' : (isBlackTheme ? '#1e1e1e' : (theme.palette[0] + '18')),
                                    color: isDefaultTheme ? '#FFFFFF' : (isBlackTheme ? '#FFFFFF' : (theme.palette[0] || '#10b981')),
                                    borderColor: isDefaultTheme ? '#000000' : (isBlackTheme ? '#333333' : theme.palette[0] + '44')
                                }}
                            >
                                <Sparkles className="w-4 h-4 animate-pulse text-amber-400" />
                                <span>عرض الفوائد والشرح المختصر للحديث</span>
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab 2: Explanation & Benefits */}
                {activeTab === 'explanation' && (
                    <div className="p-4 sm:p-6 overflow-y-auto flex-1 hide-scrollbar space-y-4">
                        {explanation ? (
                            <>
                                {/* Brief Summary */}
                                <div 
                                    className="p-4 sm:p-5 rounded-2xl border shadow-sm relative overflow-hidden"
                                    style={{
                                        backgroundColor: isBlackTheme ? '#111111' : (isDefaultTheme ? '#f9fafb' : 'rgba(0,0,0,0.02)'),
                                        borderColor: isDefaultTheme ? '#00000020' : (isBlackTheme ? '#333333' : theme.palette[0] + '30')
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2 font-bold text-sm sm:text-base" style={{ color: isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]) }}>
                                        <BookOpen className="w-5 h-5" />
                                        <span>الشرح المختصر والميسر</span>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        {explanation.summary}
                                    </p>
                                </div>

                                {/* Creed Benefits */}
                                {explanation.creedBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-2xl border shadow-sm"
                                        style={{
                                            backgroundColor: isBlackTheme ? '#121212' : (isDefaultTheme ? '#fcfcfc' : 'rgba(0,0,0,0.02)'),
                                            borderColor: isDefaultTheme ? '#00000020' : (isBlackTheme ? '#333333' : '#3b82f630')
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                                            <ShieldCheck className="w-5 h-5" />
                                            <span>الفوائد العقدية والإيمانية</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                            {explanation.creedBenefits.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Fiqh Benefits */}
                                {explanation.fiqhBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-2xl border shadow-sm"
                                        style={{
                                            backgroundColor: isBlackTheme ? '#121212' : (isDefaultTheme ? '#fcfcfc' : 'rgba(0,0,0,0.02)'),
                                            borderColor: isDefaultTheme ? '#00000020' : (isBlackTheme ? '#333333' : '#10b98130')
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                                            <Scale className="w-5 h-5" />
                                            <span>الفوائد الفقهية والعملية</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                            {explanation.fiqhBenefits.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Values Benefits */}
                                {explanation.valuesBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-2xl border shadow-sm"
                                        style={{
                                            backgroundColor: isBlackTheme ? '#121212' : (isDefaultTheme ? '#fcfcfc' : 'rgba(0,0,0,0.02)'),
                                            borderColor: isDefaultTheme ? '#00000020' : (isBlackTheme ? '#333333' : '#f59e0b30')
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-amber-600 dark:text-amber-400">
                                            <HeartHandshake className="w-5 h-5" />
                                            <span>الفوائد التربوية والسلوكية</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                            {explanation.valuesBenefits.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12 text-gray-500 text-sm">
                                جاري تحميل شرح هذا الحديث...
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Controls */}
                <div className="p-4 sm:p-5 border-t space-y-3" style={{ borderColor: 'var(--card-border)' }}>
                    <div className="flex justify-between items-center">
                        <button 
                            type="button"
                            onClick={(e) => toggleFavorite(hadith.id, e)} 
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors"
                        >
                            <i className={`fa-heart ${favorites.includes(hadith.id) ? 'fa-solid text-red-500' : 'fa-regular text-gray-500'}`}></i>
                        </button>
                        
                        <div className="flex gap-2 sm:gap-3">
                            {activeTab === 'hadith' && (
                                <button 
                                    type="button"
                                    onClick={increaseFontSize}
                                    className="w-10 h-10 rounded-full flex items-center justify-center transition bg-black/5 dark:bg-white/5 hover:bg-black/10"
                                    style={{ color: 'var(--modal-text)' }}
                                    title="تكبير النص"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                            )}

                            <button 
                                type="button"
                                onClick={activeTab === 'hadith' ? (e) => handleCopy(hadith.hadith, e) : handleCopyExplanation} 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                                title="نسخ"
                            >
                                <Copy className="w-4 h-4" />
                            </button>

                            <button 
                                type="button"
                                onClick={activeTab === 'hadith' ? (e) => handleShare(hadith, e) : handleShareExplanation} 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                                title="مشاركة كصورة"
                            >
                                <Share2 className="w-4 h-4" />
                            </button>

                            <button 
                                type="button"
                                onClick={handlePlayAudio} 
                                className="w-10 h-10 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 transition-colors text-gray-600 dark:text-gray-300" 
                                style={{ color: (isHadithPlaying || isExplanationPlaying) ? '#ef4444' : 'inherit' }}
                                title={(isHadithPlaying || isExplanationPlaying) ? "إيقاف الاستماع" : "استماع صوتي"}
                            >
                                <Volume2 className={`w-4 h-4 ${(isHadithPlaying || isExplanationPlaying) ? 'text-red-500 animate-pulse' : ''}`} />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {activeTab === 'explanation' ? (
                            <button 
                                type="button"
                                onClick={() => setActiveTab('hadith')} 
                                className="flex-1 py-2.5 rounded-xl font-bold transition hover:opacity-90 bg-gray-200 dark:bg-gray-800 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                                style={{ color: 'var(--modal-text)' }}
                            >
                                <BookOpen className="w-4 h-4" />
                                <span>العودة لنص الحديث</span>
                            </button>
                        ) : (
                            <button 
                                type="button"
                                onClick={() => setActiveTab('explanation')} 
                                className="flex-1 py-2.5 rounded-xl font-bold transition hover:opacity-90 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs sm:text-sm flex items-center justify-center gap-1.5"
                            >
                                <Lightbulb className="w-4 h-4" />
                                <span>عرض الفوائد والشرح</span>
                            </button>
                        )}

                        <button 
                            type="button"
                            onClick={onClose} 
                            className="px-6 py-2.5 rounded-xl font-bold transition hover:opacity-90 bg-gray-200 dark:bg-gray-700 text-xs sm:text-sm" 
                            style={{ color: 'var(--modal-text)' }}
                        >
                            إغلاق
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Nawawi = ({ onBack, onNavigate }: { onBack: () => void; onNavigate?: (id: string, params?: any) => void }) => {
    const { theme, themeKey } = useTheme();
    const [selectedHadith, setSelectedHadith] = useState<typeof NAWAWI_DATA[0] | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState<'hadith' | 'explanation'>('hadith');
    const [favorites, setFavorites] = useState<number[]>([]);
    const [toastMessage, setToastMessage] = useState('');
    const isBlackTheme = theme.bgColor === '#000000';
    const isDefaultTheme = themeKey === 'default';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000'));

    useEffect(() => {
        try {
            const savedFavorites = localStorage.getItem('nawawi_favorites');
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (e) {}
    }, []);

    useEffect(() => {
        const interceptor = () => {
            if (selectedHadith) {
                setSelectedHadith(null);
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedHadith]);

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setFavorites(prev => {
            const isFav = prev.includes(id);
            const newFavs = isFav ? prev.filter(f => f !== id) : [...prev, id];
            try {
                localStorage.setItem('nawawi_favorites', JSON.stringify(newFavs));
            } catch (err) {}
            return newFavs;
        });
    };

    const handleCopy = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text).then(() => {
            setToastMessage('تم النسخ إلى الحافظة بنجاح 📋');
            setTimeout(() => setToastMessage(''), 2000);
        });
    };

    const handleShare = async (hadith: any, e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: hadith.hadith,
            source: 'الأربعون النووية',
            category: hadith.title,
            theme,
            setToastMessage
        });
    };

    const handleHomeClick = () => {
        if (selectedHadith) {
            setSelectedHadith(null);
        } else {
            onBack();
        }
    };

    const toArabicDigits = (num: number) => {
        return num.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
    };

    const cleanTitle = (title: string) => {
        if (title.includes(': ')) {
            return title.split(': ')[1];
        }
        return title;
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: 'transparent', color: theme.textColor, fontFamily: theme.font }}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full">
                        <div className="absolute left-0">
                            <ThemePageLock />
                        </div>
                        <h1 className="app-top-bar__title text-2xl font-kufi">
                            الأربعون النووية
                        </h1>
                    </div>
                    <p className="app-top-bar__subtitle">متن الأربعين حديثًا مع الفوائد والشرح المختصر</p>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pb-4">
                <div className="grid grid-cols-2 gap-4">
                    {NAWAWI_DATA.map((hadith, index) => {
                        const color = theme.palette[index % theme.palette.length];
                        return (
                            <div 
                                key={hadith.id} 
                                onClick={() => {
                                    setSelectedHadith(hadith);
                                    setModalInitialTab('hadith');
                                }} 
                                className="relative group cursor-pointer active:scale-95 transition-all"
                            >
                                <div 
                                    className="h-full p-4 rounded-3xl themed-card border shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center gap-2.5 overflow-hidden min-h-[175px]" 
                                    style={{ 
                                        borderColor: cardBorderColor,
                                        borderWidth: '1.5px',
                                        borderStyle: 'solid',
                                        color: 'var(--text-color)'
                                    }}
                                >
                                    {/* Background hint */}
                                    <div 
                                        className="absolute -right-4 -top-4 w-16 h-16 rounded-full opacity-10 blur-xl pointer-events-none"
                                        style={{ backgroundColor: isDefaultTheme ? '#000000' : color }}
                                    />
                                    
                                    <div 
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-0.5 group-hover:scale-110 transition-transform duration-300 shadow-inner"
                                        style={{ 
                                            backgroundColor: isDefaultTheme ? 'rgba(0,0,0,0.05)' : color + '20',
                                            color: isDefaultTheme ? '#000000' : color,
                                            borderColor: cardBorderColor,
                                            borderWidth: '1.5px',
                                            borderStyle: 'solid'
                                        }}
                                    >
                                        <span className="text-xl font-bold" style={{ fontFamily: theme.font }}>
                                            {toArabicDigits(hadith.id)}
                                        </span>
                                    </div>
                                    
                                    <h2 className="font-bold text-xs sm:text-sm leading-snug text-gray-800 dark:text-gray-100 line-clamp-2" style={{ fontFamily: theme.font }}>
                                        {cleanTitle(hadith.title)}
                                    </h2>

                                    {/* Action Button: Explanation & Benefits */}
                                    <div className="mt-auto w-full pt-2 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedHadith(hadith);
                                                setModalInitialTab('explanation');
                                            }}
                                            className="flex-1 py-1 px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 hover:scale-105 active:scale-95"
                                            style={{
                                                backgroundColor: isDefaultTheme ? '#00000010' : (color + '15'),
                                                color: isDefaultTheme ? '#000000' : color
                                            }}
                                            title="عرض الفوائد والشرح"
                                        >
                                            <Lightbulb className="w-3 h-3 text-amber-500" />
                                            <span>الفوائد والشرح</span>
                                        </button>
                                        <div className="w-5 h-5 flex items-center justify-center opacity-60 group-hover:opacity-100 transition-opacity">
                                            <ArrowLeft className="w-3 h-3" style={{ color: isDefaultTheme ? '#000000' : color }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="shrink-0 w-full h-32"></div>
            </main>

            {selectedHadith && (
                <HadithModal 
                    hadith={selectedHadith} 
                    initialTab={modalInitialTab}
                    onClose={() => setSelectedHadith(null)} 
                    favorites={favorites}
                    toggleFavorite={toggleFavorite}
                    handleCopy={handleCopy}
                    handleShare={handleShare}
                    setToastMessage={setToastMessage}
                />
            )}

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-24 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
};

export default Nawawi;
