import React, { useState, useEffect, useMemo } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import ThemePageLock from '../components/ThemePageLock';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';
import { Search, LayoutGrid, ListFilter, HelpCircle, X, Volume2, Share2, Copy, ZoomIn, ChevronDown } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ASMAUL_HUSNA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const AsmaulHusna: React.FC<{ onBack: () => void, onNavigate: (id: string, params?: any) => void; navParams?: any; }> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { language } = useLanguage();
    const isEn = language === 'en';

    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedName, setSelectedName] = useState<AsmaulHusnaItem | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [playingText, setPlayingText] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);
    const [modalFontSize, setModalFontSize] = useState<number>(17);

    const handleToggleFontZoom = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalFontSize(prev => prev >= 27 ? 16 : prev + 3);
    };

    useEffect(() => {
        if (navParams?.nameId || navParams?.highlightId) {
            const id = Number(navParams.nameId || navParams.highlightId);
            const found = asmaulHusna.find(item => item.id === id);
            if (found) {
                setSelectedName(found);
            }
        }
    }, [navParams]);

    useEffect(() => {
        markPageAsSeen('asmaul_husna');
        if (!getGuideSeen('asmaul_husna_page_spotlight')) {
            setShowGuide(true);
        }
        const unsubscribe = subscribeTTS(setPlayingText);
        return () => {
            unsubscribe();
            stopTTS();
        };
    }, []);

    const showToast = (msg: string) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(''), 2500);
    };

    const handleHomeClick = () => {
        if (selectedName) {
            setSelectedName(null);
            return;
        }
        if (searchQuery) {
            setSearchQuery('');
            return;
        }
        onBack();
    };

    useEffect(() => {
        const interceptor = () => {
            if (selectedName) {
                setSelectedName(null);
                return true;
            }
            if (searchQuery) {
                setSearchQuery('');
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [selectedName, searchQuery]);

    const getAudioText = (item: AsmaulHusnaItem) => {
        if (isEn) {
            return `${item.transliteration}. ${item.meaningEn}. ${item.evidenceEn}`.trim();
        }
        let evidenceText = '';
        if (item.evidence) {
            const match = item.evidence.match(/(.*?)\s*\((.*?)(?::\s*(\d+))?\)/);
            if (match) {
                const verse = match[1]?.trim();
                const surah = match[2]?.trim();
                if (verse) {
                    evidenceText = `قوله تعالى: ${verse}`;
                    if (surah) {
                        evidenceText += `، من سورة ${surah.replace(/^سورة\s*/, '')}`;
                    }
                }
            } else {
                evidenceText = `قوله تعالى: ${item.evidence.replace(/[()0-9٠-٩:]/g, '').trim()}`;
            }
        }
        return `${item.name}. ${item.meaning}. ${evidenceText}`.trim();
    };

    const handlePlayAudio = (item: AsmaulHusnaItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const text = getAudioText(item);
        if (playingText === text) {
            stopTTS();
        } else {
            playTTS(text, {
                isEn,
                onToast: (msg) => showToast(msg)
            });
        }
    };

    const handleCopy = (item: AsmaulHusnaItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const copyText = isEn 
            ? `${item.transliteration} (${item.name})\n\nMeaning:\n${item.meaningEn}${item.evidenceEn ? `\n\nEvidence:\n${item.evidenceEn}` : ''}\n\nFrom Asmaul Husna (#${item.id})`
            : `${item.name} (${item.transliteration})\n\nالمعنى والدلالة:\n${item.meaning}${item.evidence ? `\n\nالدليل:\n${item.evidence}` : ''}\n\nمن أسماء الله الحسنى (رقم ${item.id})`;
        
        navigator.clipboard.writeText(copyText).then(() => {
            showToast(isEn ? 'Copied to clipboard' : 'تم النسخ إلى الحافظة');
        });
    };

    const handleShare = async (item: AsmaulHusnaItem, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        await shareAsImage({
            title: isEn ? item.transliteration : item.name,
            text: isEn 
                ? `${item.meaningEn}${item.evidenceEn ? `\n\nEvidence: ${item.evidenceEn}` : ''}`
                : `${item.meaning}${item.evidence ? `\n\nالدليل: ${item.evidence}` : ''}`,
            source: isEn ? `From Asmaul Husna (#${item.id})` : `من أسماء الله الحسنى (${toArabicNumerals(item.id)})`,
            category: isEn ? "Beautiful Names of Allah" : 'أسماء الله الحسنى',
            theme,
            setToastMessage: (msg) => showToast(msg)
        });
    };

    const renderEvidence = (evidence: string, evidenceEn: string) => {
        const textToDisplay = isEn ? evidenceEn : evidence;
        const match = textToDisplay.match(/(.*)(\(.*\))/);
        if (match) {
            const text = match[1];
            const ref = match[2];
            return (
                <>
                    {text}
                    <span className={`font-bold inline-block opacity-90 ${isEn ? 'ml-2' : 'mr-2'}`} style={{ color: tokens.primaryColor }}>
                        {ref}
                    </span>
                </>
            );
        }
        return textToDisplay;
    };

    const filteredNames = useMemo(() => {
        if (!searchQuery.trim()) return asmaulHusna;
        const q = searchQuery.trim().toLowerCase();
        return asmaulHusna.filter(item => 
            item.name.toLowerCase().includes(q) ||
            item.meaning.toLowerCase().includes(q) ||
            item.meaningEn.toLowerCase().includes(q) ||
            item.transliteration.toLowerCase().includes(q) ||
            String(item.id).includes(q) ||
            toArabicNumerals(item.id).includes(q)
        );
    }, [searchQuery]);

    const renderActionButtons = (item: AsmaulHusnaItem) => {
        const text = getAudioText(item);
        const isPlaying = playingText === text;

        return (
            <div className="flex items-center gap-2" dir="ltr">
                {/* Audio */}
                <button 
                    type="button"
                    onClick={(e) => handlePlayAudio(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                    style={{ color: isPlaying ? '#ef4444' : tokens.textColor }} 
                    title={isPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                    aria-label="Audio"
                >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-red-500 animate-pulse' : ''}`} />
                </button>

                {/* Share */}
                <button 
                    type="button"
                    onClick={(e) => handleShare(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                    style={{ color: tokens.textColor }} 
                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                    aria-label="Share"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                {/* Copy */}
                <button 
                    type="button"
                    onClick={(e) => handleCopy(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                    style={{ color: tokens.textColor }} 
                    title={isEn ? "Copy" : "نسخ"}
                    aria-label="Copy"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden relative" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: theme.font }} dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar z-20" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full min-h-[44px]">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-2 flex-1 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-bold truncate">
                                {isEn ? "Beautiful Names of Allah" : "أسماء الله الحسنى"}
                            </h1>
                        </div>

                        {/* Guide / Home / Lock */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/5 dark:hover:bg-white/5 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Asmaul Husna Guide" : "دليل أسماء الله الحسنى"}
                                aria-label={isEn ? "Asmaul Husna Guide" : "دليل أسماء الله الحسنى"}
                            >
                                <i className="fa-solid fa-circle-question text-lg"></i>
                            </button>
                            <ThemePageLock />
                            <button
                                type="button"
                                onClick={() => onNavigate('home')}
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

            {/* Controls Bar: Switch between Grid and List view + Search - Flat Surface Zero Border */}
            <div className="mb-5 px-4 max-w-3xl mx-auto w-full flex items-center gap-2.5 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                {/* Search Input */}
                <div 
                    className="relative flex-1 rounded-[18px] overflow-hidden transition-all shadow-sm border-0" 
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEn ? "Search by name or meaning..." : "ابحث بالاسم أو المعنى..."}
                        className={`w-full bg-transparent py-3.5 ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} focus:outline-none placeholder-gray-400`}
                        style={{ color: tokens.textColor }}
                    />
                    <Search 
                        className={`w-4 h-4 absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-40`} 
                        style={{ color: tokens.textColor }} 
                    />
                    {searchQuery && (
                        <button 
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600`}
                            title={isEn ? "Clear search" : "مسح البحث"}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* View Switcher: Grid vs List */}
                <div 
                    className="flex items-center p-1.5 rounded-[18px] shrink-0 shadow-sm border-0"
                    style={{
                        backgroundColor: tokens.cardBgColor,
                        boxShadow: tokens.cardShadow
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('grid')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'grid' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                        style={activeTab === 'grid' ? {
                            backgroundColor: tokens.primaryColor,
                            color: '#ffffff'
                        } : { color: tokens.textColor }}
                        title={isEn ? "Grid View" : "عرض شبكي"}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border-0 ${activeTab === 'list' ? 'shadow-sm' : 'opacity-50 hover:opacity-100'}`}
                        style={activeTab === 'list' ? {
                            backgroundColor: tokens.primaryColor,
                            color: '#ffffff'
                        } : { color: tokens.textColor }}
                        title={isEn ? "List View" : "عرض القوائم"}
                    >
                        <ListFilter size={16} />
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-1 pb-7 sm:pb-8 pb-[calc(env(safe-area-inset-bottom,0px)+1.75rem)]">
                    {filteredNames.length === 0 ? (
                        <div className="py-16 text-center opacity-60 font-bold">
                            <Search className="w-10 h-10 mb-3 mx-auto opacity-40" />
                            <p>{isEn ? 'No matching results found' : 'لا توجد نتائج مطابقة لبحثك'}</p>
                        </div>
                    ) : activeTab === 'grid' ? (
                        /* Grid View - Pure White Cards, Zero Border, Soft Elevation */
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-4xl mx-auto">
                            {filteredNames.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ y: -3, scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => setSelectedName(item)}
                                    className="relative rounded-[18px] p-3 flex flex-col items-center justify-center text-center aspect-square group transition-all duration-300 overflow-hidden cursor-pointer border-0"
                                    style={{ 
                                        backgroundColor: tokens.cardBgColor,
                                        boxShadow: tokens.cardShadow
                                    }}
                                >
                                    {/* ID Badge */}
                                    <div 
                                        className={`absolute top-2.5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isEn ? 'left-2.5' : 'right-2.5'}`}
                                        style={{
                                            backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                            color: tokens.primaryColor
                                        }}
                                    >
                                        {isEn ? item.id : toArabicNumerals(item.id)}
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center flex-1 w-full pt-2">
                                        {isEn ? (
                                            <>
                                                <h3 className="text-lg sm:text-xl font-bold font-sans leading-tight group-hover:scale-105 transition-transform duration-300" style={{ color: tokens.textColor }}>
                                                    {item.transliteration}
                                                </h3>
                                                <span className="text-xs sm:text-sm font-quran opacity-75 mt-1 truncate max-w-full px-1" style={{ color: tokens.subtextColor }}>
                                                    {item.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-xl sm:text-2xl font-bold font-quran leading-tight group-hover:scale-105 transition-transform duration-300" style={{ color: tokens.textColor }}>
                                                    {item.name}
                                                </h3>
                                                <span className="text-[10px] sm:text-xs font-semibold opacity-80 mt-1 truncate max-w-full px-1" style={{ color: tokens.subtextColor }}>
                                                    {item.transliteration}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </motion.button>
                            ))}
                            {/* Bottom Spacer for Mobile Phone Navigation Bar */}
                            <div className="col-span-full h-8 sm:h-12 pointer-events-none" />
                        </div>
                    ) : (
                        /* List View - Zero Border Policy, Pure White Cards */
                        <div className="max-w-3xl mx-auto space-y-3.5">
                            {filteredNames.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-5 rounded-[18px] relative overflow-hidden group transition-all duration-300 border-0"
                                    style={{ 
                                        backgroundColor: tokens.cardBgColor,
                                        boxShadow: tokens.cardShadow,
                                        color: tokens.textColor 
                                    }}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span 
                                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-0" 
                                            style={{ 
                                                backgroundColor: hexToRgba(tokens.primaryColor, 0.1), 
                                                color: tokens.primaryColor 
                                            }}
                                        >
                                            {item.transliteration}
                                        </span>
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
                                            style={{
                                                backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                                color: tokens.primaryColor
                                            }}
                                        >
                                            {isEn ? item.id : toArabicNumerals(item.id)}
                                        </div>
                                    </div>

                                    {isEn ? (
                                        <div onClick={() => setSelectedName(item)} className="text-center mb-2.5 cursor-pointer hover:opacity-80 transition-opacity">
                                            <h3 className="text-3xl sm:text-4xl font-bold font-sans" style={{ color: tokens.textColor }}>
                                                {item.transliteration}
                                            </h3>
                                            <span className="text-base sm:text-lg font-quran opacity-75 mt-1 block" style={{ color: tokens.subtextColor }}>
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <h3 
                                            onClick={() => setSelectedName(item)}
                                            className="text-2xl sm:text-3xl font-bold font-quran text-center mb-2.5 cursor-pointer hover:opacity-80 transition-opacity" 
                                            style={{ color: tokens.textColor }}
                                        >
                                            {item.name}
                                        </h3>
                                    )}

                                    <p className={`leading-[2.2] text-center select-none mb-3 px-2 ${isEn ? 'font-sans text-base sm:text-lg md:text-xl' : 'font-amiri text-xs sm:text-sm'}`} style={{ color: tokens.subtextColor }}>
                                        {isEn ? item.meaningEn : item.meaning}
                                    </p>

                                    {(item.evidence || item.evidenceEn) && (
                                        <div 
                                            className={`text-center py-2 px-3 rounded-[14px] mb-3 border-0 leading-relaxed ${isEn ? 'font-sans text-sm sm:text-base' : 'font-amiri text-xs sm:text-sm'}`}
                                            style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA' }}
                                        >
                                            {renderEvidence(item.evidence, item.evidenceEn)}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                        <span className="text-xs font-bold opacity-70" style={{ color: tokens.primaryColor }}>
                                            {isEn ? 'Beautiful Names of Allah' : 'من أسماء الله الحسنى'}
                                        </span>
                                        {renderActionButtons(item)}
                                    </div>
                                </div>
                            ))}
                            {/* Bottom Spacer for Mobile Phone Navigation Bar */}
                            <div className="w-full h-8 sm:h-12 pointer-events-none" />
                        </div>
                    )}
                </div>
            </main>

            {/* Modal Bottom Sheet: Full Details & Big Typography */}
            <AnimatePresence>
                {selectedName && (
                    <div 
                        className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
                        onClick={() => setSelectedName(null)}
                    >
                        <motion.div 
                            initial={{ y: '100%', opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: '100%', opacity: 0 }}
                            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                            className="rounded-t-[28px] sm:rounded-[24px] w-full max-w-xl text-center relative shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border-0" 
                            style={{ 
                                backgroundColor: tokens.cardBgColor,
                                color: tokens.textColor,
                                fontFamily: theme.font 
                            }} 
                            onClick={e => e.stopPropagation()}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            {/* Drag handle */}
                            <div className="pt-3 pb-1 flex justify-center sm:hidden">
                                <div className="w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                            </div>

                            {/* Header without X button */}
                            <div className="flex items-center justify-center px-5 pt-3 pb-2">
                                <span 
                                    className="px-3.5 py-1 rounded-full text-xs font-bold"
                                    style={{ 
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                        color: tokens.primaryColor
                                    }}
                                >
                                    {isEn ? `#${selectedName.id}` : `الاسم ${toArabicNumerals(selectedName.id)}`}
                                </span>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar flex-1 px-6 py-3 space-y-4">
                                <div>
                                    {isEn ? (
                                        <>
                                            <h2 className="text-4xl sm:text-5xl font-bold font-sans mb-1 leading-normal" style={{ color: tokens.textColor }}>
                                                {selectedName.transliteration}
                                            </h2>
                                            <span className="text-lg sm:text-xl font-quran opacity-75 block" style={{ color: tokens.primaryColor }}>
                                                {selectedName.name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-4xl sm:text-5xl font-bold font-quran mb-1 leading-normal" style={{ color: tokens.textColor }}>
                                                {selectedName.name}
                                            </h2>
                                            <span className="text-sm font-semibold opacity-80" style={{ color: tokens.primaryColor }}>
                                                {selectedName.transliteration}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div 
                                    className={`p-4 sm:p-5 rounded-[18px] leading-[2.3] text-center border-0 ${isEn ? 'font-sans' : 'font-amiri'}`}
                                    style={{ 
                                        backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA',
                                        fontSize: `${modalFontSize}px`
                                    }}
                                >
                                    <div className="text-xs font-bold mb-1 opacity-60">
                                        {isEn ? 'Meaning & Explanation' : 'المعنى والدلالة الإيمانية'}
                                    </div>
                                    <p>
                                        {isEn ? selectedName.meaningEn : selectedName.meaning}
                                    </p>
                                </div>

                                {(selectedName.evidence || selectedName.evidenceEn) && (
                                    <div 
                                        className={`p-4 rounded-[18px] leading-[2.2] text-center border-0 ${isEn ? 'font-sans' : 'font-amiri'}`}
                                        style={{ 
                                            backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : '#F8F9FA',
                                            fontSize: `${modalFontSize - 1}px`
                                        }}
                                    >
                                        <div className="text-xs font-bold mb-1.5 opacity-60">
                                            {isEn ? 'Quranic Evidence' : 'الدليل والورود في القرآن الكريم'}
                                        </div>
                                        <div>
                                            {renderEvidence(selectedName.evidence, selectedName.evidenceEn)}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions with safe-area bottom elevation */}
                            <div 
                                className="p-4 pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-center items-center gap-3 sm:gap-4"
                                style={{ 
                                    paddingBottom: 'calc(env(safe-area-inset-bottom, 16px) + 16px)'
                                }}
                            >
                                {/* Audio */}
                                <button 
                                    type="button"
                                    onClick={(e) => handlePlayAudio(selectedName, e)} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                                    style={{ color: playingText === getAudioText(selectedName) ? '#ef4444' : tokens.textColor }} 
                                    title={playingText === getAudioText(selectedName) ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                                >
                                    <Volume2 className={`w-5 h-5 ${playingText === getAudioText(selectedName) ? 'text-red-500 animate-pulse' : ''}`} />
                                </button>

                                {/* Share */}
                                <button 
                                    type="button"
                                    onClick={(e) => handleShare(selectedName, e)} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                                    style={{ color: tokens.textColor }} 
                                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>

                                {/* Copy */}
                                <button 
                                    type="button"
                                    onClick={(e) => handleCopy(selectedName, e)} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                                    style={{ color: tokens.textColor }} 
                                    title={isEn ? "Copy" : "نسخ"}
                                >
                                    <Copy className="w-5 h-5" />
                                </button>

                                {/* Zoom */}
                                <button 
                                    type="button"
                                    onClick={handleToggleFontZoom} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                                    style={{ color: tokens.textColor }} 
                                    title={isEn ? "Zoom Font" : "تكبير الخط"}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>

                                {/* ChevronDown to hide modal */}
                                <button 
                                    type="button"
                                    onClick={() => setSelectedName(null)} 
                                    className="w-11 h-11 rounded-full flex items-center justify-center bg-slate-100 dark:bg-zinc-800 hover:scale-105 active:scale-95 transition-transform cursor-pointer border-0" 
                                    style={{ color: tokens.textColor }} 
                                    title={isEn ? "Hide list" : "إخفاء القائمة"}
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div 
                        initial={{ opacity: 0, y: 50, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 50, x: '-50%' }}
                        className="fixed bottom-8 left-1/2 z-[200] bg-gray-800 text-white px-6 py-3 rounded-full shadow-lg font-bold text-sm text-center whitespace-nowrap flex items-center gap-2 pointer-events-none"
                    >
                        <i className="fa-solid fa-check text-green-400"></i>
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            <CommunitySpotlightGuide
                isOpen={showGuide}
                onClose={() => {
                    setShowGuide(false);
                    markPageAsSeen('asmaul_husna');
                }}
                steps={ASMAUL_HUSNA_PAGE_STEPS}
                guideKey="asmaul_husna_page_spotlight"
                isEn={isEn}
            />
        </div>
    );
};

export default AsmaulHusna;
