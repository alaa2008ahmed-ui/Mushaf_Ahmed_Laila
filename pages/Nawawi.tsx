import React, { useState, useEffect } from 'react';
import { NAWAWI_DATA } from '../data/nawawiData';
import { NAWAWI_DATA_EN } from '../data/nawawiDataEn';
import { NAWAWI_EXPLANATIONS, HadithExplanation } from '../data/nawawiExplanationData';
import { NAWAWI_EXPLANATIONS_EN, HadithExplanationEn } from '../data/nawawiExplanationDataEn';
import ThemePageLock from '../components/ThemePageLock';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'framer-motion';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { HelpCircle } from 'lucide-react';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { NAWAWI_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { 
    BookOpen, Sparkles, Lightbulb, Scale, ShieldCheck, 
    HeartHandshake, Copy, Share2, Volume2, ZoomIn, 
    X, ArrowRight, ArrowLeft, LayoutGrid, ListFilter,
    ChevronDown 
} from 'lucide-react';

interface HadithModalProps {
    hadith: typeof NAWAWI_DATA[0];
    hadithEn: typeof NAWAWI_DATA_EN[0];
    initialTab?: 'hadith' | 'explanation';
    onClose: () => void;
    favorites: number[];
    toggleFavorite: (id: number, e: React.MouseEvent) => void;
    handleCopy: (text: string, e: React.MouseEvent) => void;
    handleShare: (hadith: any, e: React.MouseEvent) => void;
    setToastMessage: (msg: string) => void;
    isEn: boolean;
}

const toArabicDigits = (str: number | string) => String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);

const HadithModal: React.FC<HadithModalProps> = ({ 
    hadith, 
    hadithEn,
    initialTab = 'hadith',
    onClose, 
    favorites, 
    toggleFavorite, 
    handleCopy, 
    handleShare,
    setToastMessage,
    isEn
}) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const [activeTab, setActiveTab] = useState<'hadith' | 'explanation'>(initialTab);
    const [fontSize, setFontSize] = useState(19);
    const [playingText, setPlayingText] = useState<string | null>(null);

    const activeHadithText = isEn ? hadithEn.hadith : hadith.hadith;
    const activeHadithTitle = isEn ? hadithEn.title : hadith.title;
    const explanation: HadithExplanation | undefined = NAWAWI_EXPLANATIONS[hadith.id];
    const explanationEn: HadithExplanationEn | undefined = NAWAWI_EXPLANATIONS_EN[hadith.id];
    const activeExplanation = isEn ? explanationEn : explanation;

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const isHadithPlaying = playingText === activeHadithText;
    const isExplanationPlaying = !!(activeExplanation && playingText?.includes(activeExplanation.summary.slice(0, 30)));

    const increaseFontSize = () => {
        setFontSize(prev => (prev >= 32 ? 19 : prev + 4));
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
                playTTS(activeHadithText, { hadithId: hadith.id, isEn });
            }
        } else if (activeExplanation) {
            if (isExplanationPlaying) {
                stopTTS();
            } else {
                let combinedExplanationSpeech = '';
                if (isEn) {
                    combinedExplanationSpeech = `Brief Explanation: ${activeExplanation.summary}. Creed Benefits: ${activeExplanation.creedBenefits.join('. ')}. Fiqh Benefits: ${activeExplanation.fiqhBenefits.join('. ')}. Values Benefits: ${activeExplanation.valuesBenefits.join('. ')}.`;
                } else {
                    combinedExplanationSpeech = `الشرح المختصر: ${activeExplanation.summary}. الفوائد العقدية: ${activeExplanation.creedBenefits.join('. ')}. الفوائد الفقهية: ${activeExplanation.fiqhBenefits.join('. ')}. الفوائد التربوية: ${activeExplanation.valuesBenefits.join('. ')}.`;
                }
                playTTS(combinedExplanationSpeech, { isEn });
            }
        }
    };

    const handleCopyExplanation = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeExplanation) return;
        let text = `📚 ${activeHadithTitle}\n\n`;
        if (isEn) {
            text += `📖 Brief Explanation:\n${activeExplanation.summary}\n\n`;
            if (activeExplanation.creedBenefits?.length) {
                text += `💎 Creed & Faith Benefits:\n` + activeExplanation.creedBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            if (activeExplanation.fiqhBenefits?.length) {
                text += `⚖️ Jurisprudential Benefits:\n` + activeExplanation.fiqhBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            if (activeExplanation.valuesBenefits?.length) {
                text += `🌿 Educational & Behavioral Benefits:\n` + activeExplanation.valuesBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            text += `— From Ahmed & Layla Mushaf App (Al-Arba'in Al-Nawawiyyah)`;
        } else {
            text += `📖 الشرح المختصر:\n${activeExplanation.summary}\n\n`;
            if (activeExplanation.creedBenefits?.length) {
                text += `💎 الفوائد العقدية والإيمانية:\n` + activeExplanation.creedBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            if (activeExplanation.fiqhBenefits?.length) {
                text += `⚖️ الفوائد الفقهية والعملية:\n` + activeExplanation.fiqhBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            if (activeExplanation.valuesBenefits?.length) {
                text += `🌿 الفوائد التربوية والسلوكية:\n` + activeExplanation.valuesBenefits.map((b) => `• ${b}`).join('\n') + `\n\n`;
            }
            text += `— من تطبيق مصحف أحمد و ليلى (الأربعون النووية)`;
        }
        handleCopy(text, e);
    };

    const handleShareExplanation = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!activeExplanation) return;
        let text = '';
        if (isEn) {
            text = `📖 Brief Explanation:\n${activeExplanation.summary}\n\n`;
            text += `💎 Creed Benefits:\n` + activeExplanation.creedBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
            text += `⚖️ Fiqh Benefits:\n` + activeExplanation.fiqhBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
            text += `🌿 Behavioral Benefits:\n` + activeExplanation.valuesBenefits.map(b => `• ${b}`).join('\n');
        } else {
            text = `📖 الشرح المختصر:\n${activeExplanation.summary}\n\n`;
            text += `💎 الفوائد العقدية والإيمانية:\n` + activeExplanation.creedBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
            text += `⚖️ الفوائد الفقهية والعملية:\n` + activeExplanation.fiqhBenefits.map(b => `• ${b}`).join('\n') + `\n\n`;
            text += `🌿 الفوائد التربوية والسلوكية:\n` + activeExplanation.valuesBenefits.map(b => `• ${b}`).join('\n');
        }

        await shareAsImage({
            text,
            source: isEn ? "Al-Nawawi's 40 Hadith - Explanation" : 'الأربعون النووية - الفوائد والشرح',
            category: activeHadithTitle,
            theme,
            setToastMessage
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4" 
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="w-full max-w-xl max-h-[88vh] rounded-t-[28px] sm:rounded-[24px] flex flex-col overflow-hidden shadow-2xl border-0" 
                style={{ 
                    backgroundColor: tokens.cardBgColor, 
                    color: tokens.textColor, 
                    fontFamily: theme.font
                }} 
                onClick={(e) => e.stopPropagation()}
                dir={isEn ? 'ltr' : 'rtl'}
            >
                {/* Drag Handle Indicator */}
                <div className="pt-3 pb-1 flex justify-center sm:hidden">
                    <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                </div>

                {/* Header */}
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                    <div className="flex items-center justify-between w-full">
                        <span 
                            className="px-3 py-1 rounded-full text-xs font-bold"
                            style={{ 
                                backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                color: tokens.primaryColor
                            }}
                        >
                            {isEn ? `Hadith ${hadith.id}` : `الحديث ${toArabicDigits(hadith.id)}`}
                        </span>
                        
                        <h3 className="text-sm sm:text-base font-bold text-center flex-1 mx-2 truncate" style={{ color: tokens.textColor }}>
                            {cleanTitle(activeHadithTitle)}
                        </h3>
                    </div>

                    {/* Modern Segmented Control / Tabs - Zero border */}
                    <div className="flex p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-800 gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveTab('hadith')}
                            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'hadith' 
                                    ? 'shadow-sm' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            style={
                                activeTab === 'hadith'
                                    ? { 
                                        backgroundColor: tokens.primaryColor,
                                        color: '#FFFFFF'
                                      }
                                    : { color: tokens.subtextColor }
                            }
                        >
                            <BookOpen className="w-4 h-4" />
                            <span>{isEn ? 'Hadith Text' : 'نص الحديث'}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab('explanation')}
                            className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                activeTab === 'explanation' 
                                    ? 'shadow-sm' 
                                    : 'opacity-70 hover:opacity-100'
                            }`}
                            style={
                                activeTab === 'explanation'
                                    ? { 
                                        backgroundColor: tokens.primaryColor,
                                        color: '#FFFFFF'
                                      }
                                    : { color: tokens.subtextColor }
                            }
                        >
                            <Lightbulb className="w-4 h-4" />
                            <span>{isEn ? 'Explanation & Benefits' : 'الفوائد والشرح المختصر'}</span>
                        </button>
                    </div>
                </div>
                
                {/* Tab 1: Hadith Text */}
                {activeTab === 'hadith' && (
                    <div className="p-6 sm:p-8 overflow-y-auto leading-[2.3] text-center flex-1 hide-scrollbar" style={{ fontSize: `${fontSize}px`, color: tokens.textColor }}>
                        <p className={`whitespace-pre-line leading-[2.3] selection:bg-amber-100 ${isEn ? 'font-sans text-left' : 'font-amiri'}`} style={{ textAlign: isEn ? 'left' : 'center' }}>
                            {activeHadithText}
                        </p>

                        {/* Quick Prominent Switcher to Explanation */}
                        <div className="mt-8 pt-4 flex justify-center">
                            <button
                                type="button"
                                onClick={() => setActiveTab('explanation')}
                                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-sm hover:scale-105 active:scale-95 transition-all border-0 cursor-pointer"
                                style={{
                                    backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                    color: tokens.primaryColor
                                }}
                            >
                                <Sparkles className="w-4 h-4 animate-pulse text-amber-500" />
                                <span>{isEn ? 'View Hadith Explanation & Benefits' : 'عرض الفوائد والشرح المختصر للحديث'}</span>
                                {isEn ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                )}

                {/* Tab 2: Explanation & Benefits */}
                {activeTab === 'explanation' && (
                    <div className={`p-4 sm:p-6 overflow-y-auto flex-1 hide-scrollbar space-y-4 ${isEn ? 'text-left' : 'text-right'}`}>
                        {activeExplanation ? (
                            <>
                                {/* Brief Summary */}
                                <div 
                                    className="p-4 sm:p-5 rounded-[18px] shadow-sm relative overflow-hidden border-0"
                                    style={{
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA'
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-2 font-bold text-sm sm:text-base" style={{ color: tokens.primaryColor }}>
                                        <BookOpen className="w-5 h-5 shrink-0" />
                                        <span>{isEn ? 'Brief & Simplified Explanation' : 'الشرح المختصر والميسر'}</span>
                                    </div>
                                    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: tokens.subtextColor }}>
                                        {activeExplanation.summary}
                                    </p>
                                </div>

                                {/* Creed Benefits */}
                                {activeExplanation.creedBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] shadow-sm border-0"
                                        style={{
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA'
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-blue-600 dark:text-blue-400">
                                            <ShieldCheck className="w-5 h-5 shrink-0" />
                                            <span>{isEn ? 'Creed & Faith Benefits' : 'الفوائد العقدية والإيمانية'}</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed" style={{ color: tokens.subtextColor }}>
                                            {activeExplanation.creedBenefits.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Fiqh Benefits */}
                                {activeExplanation.fiqhBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] shadow-sm border-0"
                                        style={{
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA'
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-emerald-600 dark:text-emerald-400">
                                            <Scale className="w-5 h-5 shrink-0" />
                                            <span>{isEn ? 'Jurisprudential & Practical Benefits' : 'الفوائد الفقهية والعملية'}</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed" style={{ color: tokens.subtextColor }}>
                                            {activeExplanation.fiqhBenefits.map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {/* Values Benefits */}
                                {activeExplanation.valuesBenefits?.length > 0 && (
                                    <div 
                                        className="p-4 sm:p-5 rounded-[18px] shadow-sm border-0"
                                        style={{
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA'
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-3 font-bold text-sm sm:text-base text-amber-600 dark:text-amber-400">
                                            <HeartHandshake className="w-5 h-5 shrink-0" />
                                            <span>{isEn ? 'Educational & Behavioral Benefits' : 'الفوائد التربوية والسلوكية'}</span>
                                        </div>
                                        <ul className="space-y-2 text-xs sm:text-sm leading-relaxed" style={{ color: tokens.subtextColor }}>
                                            {activeExplanation.valuesBenefits.map((item, idx) => (
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
                                {isEn ? 'Loading explanation...' : 'جاري تحميل شرح هذا الحديث...'}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Controls - Clean Modern Style with safe-area padding to avoid phone buttons */}
                <div 
                    className="p-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-center gap-3 sm:gap-4"
                    style={{ 
                        paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
                    }}
                >
                    {/* Audio */}
                    <button 
                        type="button"
                        onClick={handlePlayAudio} 
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0" 
                        style={{ color: (isHadithPlaying || isExplanationPlaying) ? '#ef4444' : 'inherit' }}
                        title={(isHadithPlaying || isExplanationPlaying) ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                    >
                        <Volume2 className={`w-5 h-5 ${(isHadithPlaying || isExplanationPlaying) ? 'text-red-500 animate-pulse' : ''}`} />
                    </button>

                    {/* Share */}
                    <button 
                        type="button"
                        onClick={activeTab === 'hadith' ? (e) => handleShare(isEn ? hadithEn : hadith, e) : handleShareExplanation} 
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0" 
                        title={isEn ? "Share as Image" : "مشاركة كصورة"}
                    >
                        <Share2 className="w-5 h-5" />
                    </button>

                    {/* Copy */}
                    <button 
                        type="button"
                        onClick={activeTab === 'hadith' ? (e) => handleCopy(activeHadithText, e) : handleCopyExplanation} 
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0" 
                        title={isEn ? "Copy" : "نسخ"}
                    >
                        <Copy className="w-5 h-5" />
                    </button>

                    {/* Zoom */}
                    <button 
                        type="button"
                        onClick={increaseFontSize}
                        className="w-11 h-11 rounded-full flex items-center justify-center transition bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 cursor-pointer border-0"
                        style={{ color: tokens.textColor }}
                        title={isEn ? "Zoom In Font" : "تكبير الخط"}
                    >
                        <ZoomIn className="w-5 h-5" />
                    </button>

                    {/* ChevronDown to hide modal */}
                    <button 
                        type="button"
                        onClick={onClose} 
                        className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0" 
                        title={isEn ? "Hide list" : "إخفاء القائمة"}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

interface NawawiProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
    navParams?: any;
}

const Nawawi: React.FC<NawawiProps> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { language } = useLanguage();
    const isEn = language === 'en';

    const [selectedHadith, setSelectedHadith] = useState<typeof NAWAWI_DATA[0] | null>(null);
    const [modalInitialTab, setModalInitialTab] = useState<'hadith' | 'explanation'>('hadith');
    const [searchQuery, setSearchQuery] = useState('');
    const [favorites, setFavorites] = useState<number[]>([]);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [activeTabMode, setActiveTabMode] = useState<'grid' | 'list'>('grid');
    const [playingText, setPlayingText] = useState<string | null>(null);

    useEffect(() => {
        if (navParams?.hadithId || navParams?.highlightId) {
            const id = Number(navParams.hadithId || navParams.highlightId);
            const found = NAWAWI_DATA.find(h => h.id === id);
            if (found) {
                setSelectedHadith(found);
            }
        }
    }, [navParams]);

    useEffect(() => {
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    useEffect(() => {
        const unregister = registerBackInterceptor(() => {
            if (showGuide) {
                setShowGuide(false);
                return true;
            }
            if (selectedHadith) {
                setSelectedHadith(null);
                return true;
            }
            onBack();
            return true;
        });
        return () => unregister();
    }, [selectedHadith, showGuide, onBack]);

    useEffect(() => {
        const savedFavorites = localStorage.getItem('nawawi_favorites');
        if (savedFavorites) {
            setFavorites(JSON.parse(savedFavorites));
        }

        const guideSeen = getGuideSeen('nawawi_page_spotlight');
        if (!guideSeen) {
            setShowGuide(true);
        }
    }, []);

    const toggleFavorite = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const updatedFavorites = favorites.includes(id)
            ? favorites.filter(favId => favId !== id)
            : [...favorites, id];

        setFavorites(updatedFavorites);
        localStorage.setItem('nawawi_favorites', JSON.stringify(updatedFavorites));
    };

    const handleCopy = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        setToastMessage(isEn ? 'Copied to clipboard' : 'تم النسخ بنجاح');
        setTimeout(() => setToastMessage(null), 2000);
    };

    const handleShare = async (hadithItem: typeof NAWAWI_DATA[0] | typeof NAWAWI_DATA_EN[0], e: React.MouseEvent) => {
        e.stopPropagation();
        await shareAsImage({
            text: hadithItem.hadith,
            source: isEn ? "Al-Nawawi's 40 Hadith" : 'الأربعون النووية',
            category: hadithItem.title,
            theme,
            setToastMessage
        });
    };

    const handlePlayHadithAudio = (hadithItem: typeof NAWAWI_DATA[0], hadithItemEn: typeof NAWAWI_DATA_EN[0], e: React.MouseEvent) => {
        e.stopPropagation();
        const textToPlay = isEn ? hadithItemEn.hadith : hadithItem.hadith;
        if (playingText === textToPlay) {
            stopTTS();
            setPlayingText(null);
        } else {
            playTTS(textToPlay, { hadithId: hadithItem.id, isEn });
        }
    };

    const cleanTitle = (title: string) => {
        if (title.includes(': ')) {
            return title.split(': ')[1];
        }
        return title;
    };

    const filteredHadiths = NAWAWI_DATA.map((hadith, index) => ({
        hadith,
        hadithEn: NAWAWI_DATA_EN[index],
        explanation: NAWAWI_EXPLANATIONS[hadith.id],
        explanationEn: NAWAWI_EXPLANATIONS_EN[hadith.id],
        index
    })).filter(({ hadith, hadithEn, explanation, explanationEn }) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        const idStr = String(hadith.id);
        const idArabic = toArabicDigits(hadith.id);
        if (idStr === q || idArabic === q) return true;

        const titleAr = (hadith.title || '').toLowerCase();
        const titleEn = (hadithEn?.title || '').toLowerCase();
        const textAr = (hadith.hadith || '').toLowerCase();
        const textEn = (hadithEn?.hadith || '').toLowerCase();
        const summaryAr = (explanation?.summary || '').toLowerCase();
        const summaryEn = (explanationEn?.summary || '').toLowerCase();
        const benefitsAr = [
            ...(explanation?.creedBenefits || []),
            ...(explanation?.fiqhBenefits || []),
            ...(explanation?.valuesBenefits || [])
        ].join(' ').toLowerCase();
        const benefitsEn = [
            ...(explanationEn?.creedBenefits || []),
            ...(explanationEn?.fiqhBenefits || []),
            ...(explanationEn?.valuesBenefits || [])
        ].join(' ').toLowerCase();

        return (
            titleAr.includes(q) ||
            titleEn.includes(q) ||
            textAr.includes(q) ||
            textEn.includes(q) ||
            summaryAr.includes(q) ||
            summaryEn.includes(q) ||
            benefitsAr.includes(q) ||
            benefitsEn.includes(q)
        );
    });

    return (
        <div className="h-screen flex flex-col overflow-hidden" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }} dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar">
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-center w-full min-h-[44px]">
                        {/* Back button */}
                        <div className={`absolute ${isEn ? 'left-0' : 'right-0'} flex items-center`}>
                            <button
                                onClick={onBack}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-12 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {isEn ? "Al-Nawawi's 40 Hadith" : "الأربعون النووية"}
                            </h1>
                        </div>

                        {/* Home / Lock */}
                        <div className={`absolute ${isEn ? 'right-0' : 'left-0'} flex items-center gap-1`}>
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Nawawi Guide" : "دليل وشرح الأربعون النووية"}
                                aria-label={isEn ? "Nawawi Guide" : "دليل وشرح الأربعون النووية"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                onClick={() => onNavigate ? onNavigate('home') : onBack()}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                title={isEn ? "Home" : "الصفحة الرئيسية"}
                                aria-label={isEn ? "Home" : "الصفحة الرئيسية"}
                            >
                                <i className="fa-solid fa-house text-xl"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto hide-scrollbar px-4 pt-3 pb-6">
                {/* Search and View Mode Control - Flat Modern Surface */}
                <div className="mb-5 max-w-3xl mx-auto flex items-center gap-2.5 w-full" dir={isEn ? 'ltr' : 'rtl'}>
                    <div 
                        className="relative flex-1 rounded-[18px] overflow-hidden transition-all shadow-sm border-0" 
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <input 
                            type="text" 
                            placeholder={isEn ? "Search hadith, title, explanation..." : "ابحث في الأحاديث والشرح والفوائد..."} 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full bg-transparent py-3.5 ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} focus:outline-none placeholder-gray-400`}
                            style={{ color: tokens.textColor }}
                        />
                        <i 
                            className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-40`} 
                            style={{ color: tokens.textColor }}
                        ></i>
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600`}
                            >
                                <i className="fa-solid fa-times text-xs"></i>
                            </button>
                        )}
                    </div>

                    {/* View Mode Switch - Flat Surface, Zero border */}
                    <div 
                        className="flex items-center p-1.5 rounded-[18px] shrink-0 shadow-sm border-0"
                        style={{
                            backgroundColor: tokens.cardBgColor,
                            boxShadow: tokens.cardShadow
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => setActiveTabMode('grid')}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabMode === 'grid' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                            style={activeTabMode === 'grid' ? {
                                backgroundColor: tokens.primaryColor,
                                color: '#ffffff'
                            } : { color: tokens.textColor }}
                            title={isEn ? "Grid View" : "عرض شبكي"}
                        >
                            <LayoutGrid size={16} />
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTabMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTabMode === 'list' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                            style={activeTabMode === 'list' ? {
                                backgroundColor: tokens.primaryColor,
                                color: '#ffffff'
                            } : { color: tokens.textColor }}
                            title={isEn ? "Explanation Lists" : "قوائم الشرح"}
                        >
                            <ListFilter size={16} />
                        </button>
                    </div>
                </div>

                {filteredHadiths.length > 0 ? (
                    activeTabMode === 'grid' ? (
                        /* Mode 1: Grid Cards - Zero Border Policy, Pure White, Soft Shadow */
                        <div className="grid grid-cols-2 gap-3.5 max-w-4xl mx-auto">
                            {filteredHadiths.map(({ hadith, hadithEn, index }) => {
                                const displayTitle = isEn ? hadithEn.title : hadith.title;
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
                                            className="h-full p-4 rounded-[18px] transition-all flex flex-col items-center text-center gap-2.5 overflow-hidden min-h-[175px] border-0" 
                                            style={{ 
                                                backgroundColor: tokens.cardBgColor,
                                                boxShadow: tokens.cardShadow,
                                                color: tokens.textColor
                                            }}
                                        >
                                            <div 
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-0.5 group-hover:scale-105 transition-transform duration-300"
                                                style={{ 
                                                    backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                    color: tokens.primaryColor
                                                }}
                                            >
                                                <span className="text-xl font-bold" style={{ fontFamily: theme.font }}>
                                                    {isEn ? hadith.id : toArabicDigits(hadith.id)}
                                                </span>
                                            </div>
                                            
                                            <h2 className="font-bold text-xs sm:text-sm leading-snug line-clamp-2" style={{ color: tokens.textColor, fontFamily: theme.font }}>
                                                {cleanTitle(displayTitle)}
                                            </h2>

                                            {/* Action Button: Explanation & Benefits */}
                                            <div className="mt-auto w-full pt-2.5 flex items-center justify-between gap-1">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedHadith(hadith);
                                                        setModalInitialTab('explanation');
                                                    }}
                                                    className="flex-1 py-1.5 px-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 hover:scale-105 active:scale-95 cursor-pointer border-0"
                                                    style={{
                                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                        color: tokens.primaryColor
                                                    }}
                                                    title={isEn ? "View Explanation & Benefits" : "عرض الفوائد والشرح"}
                                                >
                                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    <span className="truncate">{isEn ? 'Explanation' : 'الفوائد والشرح'}</span>
                                                </button>
                                                <div className="w-6 h-6 rounded-full flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity">
                                                    {isEn ? (
                                                        <ArrowRight className="w-3.5 h-3.5" style={{ color: tokens.primaryColor }} />
                                                    ) : (
                                                        <ArrowLeft className="w-3.5 h-3.5" style={{ color: tokens.primaryColor }} />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        /* Mode 2: Explanation Lists - Zero Border, Soft Elevation */
                        <div className="space-y-3.5 max-w-3xl mx-auto">
                            {filteredHadiths.map(({ hadith, hadithEn, explanation, explanationEn, index }) => {
                                const displayTitle = isEn ? hadithEn.title : hadith.title;
                                const activeExp = isEn ? explanationEn : explanation;
                                const activeText = isEn ? hadithEn.hadith : hadith.hadith;
                                const isHadithPlaying = playingText === activeText;

                                return (
                                    <div 
                                        key={hadith.id} 
                                        className="p-5 rounded-[18px] flex flex-col justify-between transition-all overflow-hidden border-0" 
                                        style={{ 
                                            backgroundColor: tokens.cardBgColor,
                                            boxShadow: tokens.cardShadow,
                                            color: tokens.textColor
                                        }}
                                    >
                                        {/* Top Bar with Number Badge & Title & Favorite */}
                                        <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div 
                                                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                                                    style={{ 
                                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                        color: tokens.primaryColor
                                                    }}
                                                >
                                                    <span className="text-base font-bold" style={{ fontFamily: theme.font }}>
                                                        {isEn ? hadith.id : toArabicDigits(hadith.id)}
                                                    </span>
                                                </div>
                                                <h2 className="font-bold text-sm sm:text-base truncate" style={{ color: tokens.textColor, fontFamily: theme.font }}>
                                                    {cleanTitle(displayTitle)}
                                                </h2>
                                            </div>
                                        </div>

                                        {/* Brief Explanation Summary - Main feature of Explanation List */}
                                        {activeExp?.summary && (
                                            <div 
                                                className="p-4 rounded-[14px] mb-3 relative overflow-hidden border-0"
                                                style={{
                                                    backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA'
                                                }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-1.5 font-bold text-xs sm:text-sm" style={{ color: tokens.primaryColor }}>
                                                    <BookOpen className="w-4 h-4 shrink-0" />
                                                    <span>{isEn ? 'Brief Explanation:' : 'الشرح المختصر والميسر:'}</span>
                                                </div>
                                                <p className="text-xs sm:text-sm leading-relaxed" style={{ color: tokens.subtextColor }}>
                                                    {activeExp.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Benefits Pills Preview - Soft Tints without solid border */}
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {activeExp?.creedBenefits?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border-0">
                                                    <ShieldCheck className="w-3 h-3" />
                                                    <span>{isEn ? `${activeExp.creedBenefits.length} Creed Benefits` : `${toArabicDigits(activeExp.creedBenefits.length)} فوائد عقدية`}</span>
                                                </span>
                                            )}
                                            {activeExp?.fiqhBenefits?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                                                    <Scale className="w-3 h-3" />
                                                    <span>{isEn ? `${activeExp.fiqhBenefits.length} Fiqh Benefits` : `${toArabicDigits(activeExp.fiqhBenefits.length)} فوائد فقهية`}</span>
                                                </span>
                                            )}
                                            {activeExp?.valuesBenefits?.length > 0 && (
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-0">
                                                    <HeartHandshake className="w-3 h-3" />
                                                    <span>{isEn ? `${activeExp.valuesBenefits.length} Value Benefits` : `${toArabicDigits(activeExp.valuesBenefits.length)} فوائد تربوية`}</span>
                                                </span>
                                            )}
                                        </div>

                                        {/* Action Buttons Footer */}
                                        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedHadith(hadith);
                                                        setModalInitialTab('explanation');
                                                    }}
                                                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer shadow-sm border-0"
                                                    style={{
                                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                        color: tokens.primaryColor
                                                    }}
                                                    title={isEn ? "Full Explanation & Benefits" : "عرض الفوائد والشرح الكامل"}
                                                >
                                                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                                    <span>{isEn ? 'Full Explanation' : 'الفوائد والشرح'}</span>
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedHadith(hadith);
                                                        setModalInitialTab('hadith');
                                                    }}
                                                    className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer border-0 bg-slate-100 dark:bg-zinc-800"
                                                    style={{ color: tokens.textColor }}
                                                    title={isEn ? "Hadith Text" : "نص الحديث"}
                                                >
                                                    <BookOpen className="w-3.5 h-3.5 shrink-0" />
                                                    <span>{isEn ? 'Hadith Text' : 'نص الحديث'}</span>
                                                </button>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <button
                                                    type="button"
                                                    onClick={(e) => handleCopy(activeText, e)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0"
                                                    title={isEn ? "Copy Hadith" : "نسخ الحديث"}
                                                >
                                                    <Copy className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handleShare(isEn ? hadithEn : hadith, e)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0"
                                                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                                                >
                                                    <Share2 className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={(e) => handlePlayHadithAudio(hadith, hadithEn, e)}
                                                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 transition-transform text-gray-600 dark:text-gray-300 cursor-pointer border-0"
                                                    style={{ color: isHadithPlaying ? '#ef4444' : 'inherit' }}
                                                    title={isHadithPlaying ? (isEn ? "Stop Audio" : "إيقاف") : (isEn ? "Play Audio" : "استماع")}
                                                >
                                                    <Volume2 className={`w-3.5 h-3.5 ${isHadithPlaying ? 'text-red-500 animate-pulse' : ''}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )
                ) : (
                    <div className="text-center py-16">
                        <p className="text-gray-500 font-bold text-base">
                            {isEn ? "No hadith found matching your search" : "لا توجد نتائج مطابقة لبحثك في الأربعين النووية"}
                        </p>
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className="mt-3 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm cursor-pointer border-0"
                            style={{ backgroundColor: tokens.primaryColor }}
                        >
                            {isEn ? "Clear search" : "مسح البحث"}
                        </button>
                    </div>
                )}
                <div className="shrink-0 w-full h-6"></div>
            </main>

            <AnimatePresence>
                {selectedHadith && (
                    <HadithModal 
                        hadith={selectedHadith} 
                        hadithEn={NAWAWI_DATA_EN[selectedHadith.id - 1]}
                        initialTab={modalInitialTab}
                        onClose={() => setSelectedHadith(null)} 
                        favorites={favorites}
                        toggleFavorite={toggleFavorite}
                        handleCopy={handleCopy}
                        handleShare={handleShare}
                        setToastMessage={setToastMessage}
                        isEn={isEn}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap"
                    >
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interactive Spotlight Guide */}
            <CommunitySpotlightGuide
                guideKey="nawawi_page_spotlight"
                steps={NAWAWI_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('nawawi');
                }}
                isEn={isEn}
            />
        </div>
    );
};

export default Nawawi;
