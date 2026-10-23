import React, { useState, useEffect, useMemo } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { motion, AnimatePresence } from 'motion/react';
import ThemePageLock from '../components/ThemePageLock';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';
import { Search, LayoutGrid, ListFilter, HelpCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ASMAUL_HUSNA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const AsmaulHusna: React.FC<{ onBack: () => void, onNavigate: (id: string, params?: any) => void; }> = ({ onBack, onNavigate }) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isDefaultTheme = themeKey === 'default' || !themeKey || theme.name?.includes('الافتراضي') || theme.name === 'Default' || !!theme.isOriginal;
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود' || themeKey === 'deep_black';
    const cardBorderColor = isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? 'rgba(255, 255, 255, 0.2)' 
            : (theme.palette?.[0] + '33' || 'rgba(0, 0, 0, 0.08)'));

    const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedName, setSelectedName] = useState<AsmaulHusnaItem | null>(null);
    const [zoomedName, setZoomedName] = useState<AsmaulHusnaItem | null>(null);
    const [toastMessage, setToastMessage] = useState('');
    const [playingText, setPlayingText] = useState<string | null>(null);
    const [showGuide, setShowGuide] = useState(false);

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
        if (zoomedName) {
            setZoomedName(null);
            return;
        }
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
            if (zoomedName) {
                setZoomedName(null);
                return true;
            }
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
    }, [zoomedName, selectedName, searchQuery]);

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
                    <span className={`font-bold inline-block opacity-90 ${isEn ? 'ml-2' : 'mr-2'}`} style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
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
            <div className="flex items-center gap-2.5" dir="ltr">
                {/* Audio */}
                <button 
                    type="button"
                    onClick={(e) => handlePlayAudio(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all opacity-70 hover:opacity-100 cursor-pointer shadow-xs" 
                    style={{ color: isPlaying ? '#ef4444' : 'var(--text-color)' }} 
                    title={isPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                    aria-label="Audio"
                >
                    <i className={`fa-solid ${isPlaying ? 'fa-circle-pause text-red-500 animate-pulse text-base' : 'fa-volume-high text-sm'}`}></i>
                </button>

                {/* Share */}
                <button 
                    type="button"
                    onClick={(e) => handleShare(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all opacity-70 hover:opacity-100 cursor-pointer shadow-xs" 
                    style={{ color: 'var(--text-color)' }} 
                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                    aria-label="Share"
                >
                    <i className="fa-solid fa-share-nodes text-sm"></i>
                </button>

                {/* Copy */}
                <button 
                    type="button"
                    onClick={(e) => handleCopy(item, e)} 
                    className="w-9 h-9 rounded-full flex items-center justify-center bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 transition-all opacity-70 hover:opacity-100 cursor-pointer shadow-xs" 
                    style={{ color: 'var(--text-color)' }} 
                    title={isEn ? "Copy" : "نسخ"}
                    aria-label="Copy"
                >
                    <i className="fa-regular fa-copy text-sm"></i>
                </button>
            </div>
        );
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden relative bg-transparent" dir={isEn ? 'ltr' : 'rtl'}>
            <header className="app-top-bar z-20" dir={isEn ? 'ltr' : 'rtl'}>
                <div className="app-top-bar__inner">
                    <div className="relative flex items-center justify-between w-full min-h-[44px]">
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={handleHomeClick}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                title={isEn ? "Back" : "رجوع للخلف"}
                                aria-label={isEn ? "Back" : "رجوع للخلف"}
                            >
                                <i className={`fa-solid ${isEn ? 'fa-arrow-left' : 'fa-arrow-right'} text-xl`}></i>
                            </button>
                        </div>

                        {/* Title */}
                        <div className="text-center px-2 flex-1 min-w-0">
                            <h1 className="app-top-bar__title text-lg sm:text-xl font-kufi truncate">
                                {isEn ? "Beautiful Names of Allah" : "أسماء الله الحسنى"}
                            </h1>
                        </div>

                        {/* Guide / Home / Lock */}
                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setShowGuide(true)}
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 cursor-pointer"
                                style={{ color: 'var(--top-bar-text, inherit)' }}
                                title={isEn ? "Asmaul Husna Guide" : "دليل أسماء الله الحسنى"}
                                aria-label={isEn ? "Asmaul Husna Guide" : "دليل أسماء الله الحسنى"}
                            >
                                <HelpCircle size={19} />
                            </button>
                            <ThemePageLock />
                            <button
                                type="button"
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

            {/* Controls Bar: Switch between Grid and List view + Search - Matches Adia/OthersPage */}
            <div className="mb-6 px-4 max-w-3xl mx-auto w-full flex items-center gap-2 z-10 shrink-0" dir={isEn ? 'ltr' : 'rtl'}>
                {/* Search Input */}
                <div 
                    className="relative flex-1 border-2 rounded-2xl overflow-hidden focus-within:ring-2 transition-all shadow-sm" 
                    style={{ borderColor: cardBorderColor, ...(isDefaultTheme ? { focusRingColor: '#000'} : { focusRingColor: theme.palette[0]}) }}
                >
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEn ? "Search by name or meaning..." : "ابحث بالاسم أو المعنى..."}
                        className={`w-full bg-black/5 dark:bg-white/5 py-3 ${isEn ? 'pl-12 pr-10 text-left font-sans' : 'pr-12 pl-10 text-right font-kufi'} focus:outline-none placeholder-gray-500 dark:placeholder-gray-400`}
                        style={{ color: 'var(--text-color)' }}
                    />
                    <i 
                        className={`fa-solid fa-search absolute ${isEn ? 'left-4' : 'right-4'} top-1/2 transform -translate-y-1/2 opacity-50`} 
                        style={{ color: 'var(--text-color)' }}
                    ></i>
                    {searchQuery && (
                        <button 
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className={`absolute inset-y-0 ${isEn ? 'right-4' : 'left-4'} flex items-center text-gray-400 hover:text-gray-600`}
                            title={isEn ? "Clear search" : "مسح البحث"}
                        >
                            <i className="fa-solid fa-times text-xs"></i>
                        </button>
                    )}
                </div>

                {/* View Switcher: Grid vs List */}
                <div 
                    className="flex items-center p-1 rounded-2xl border shrink-0 shadow-sm"
                    style={{
                        backgroundColor: isBlackTheme ? '#111111' : (theme.isDark ? '#1e293b' : '#ffffff'),
                        borderColor: cardBorderColor
                    }}
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('grid')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                        style={activeTab === 'grid' ? {
                            backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                            color: isBlackTheme ? '#000000' : '#ffffff'
                        } : { color: 'var(--text-color)' }}
                        title={isEn ? "Grid View" : "عرض شبكي"}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'list' ? 'shadow-sm' : 'opacity-60 hover:opacity-100'}`}
                        style={activeTab === 'list' ? {
                            backgroundColor: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]),
                            color: isBlackTheme ? '#000000' : '#ffffff'
                        } : { color: 'var(--text-color)' }}
                        title={isEn ? "List View" : "عرض القوائم"}
                    >
                        <ListFilter size={16} />
                    </button>
                </div>
            </div>

            <main className="flex-1 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 overflow-y-auto hide-scrollbar pt-1 pb-10">
                    {filteredNames.length === 0 ? (
                        <div className="py-16 text-center opacity-60 font-bold">
                            <i className="fa-solid fa-search text-4xl mb-3 block opacity-40"></i>
                            <p>{isEn ? 'No matching results found' : 'لا توجد نتائج مطابقة لبحثك'}</p>
                        </div>
                    ) : activeTab === 'grid' ? (
                        /* Grid View */
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-w-3xl mx-auto">
                            {filteredNames.map((item) => (
                                <motion.button
                                    key={item.id}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedName(item)}
                                    className="relative themed-card rounded-xl sm:rounded-2xl p-1.5 sm:p-3 flex flex-col items-center justify-center text-center aspect-square group border shadow-sm transition-all duration-300 overflow-hidden cursor-pointer"
                                    style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                                >
                                    {/* ID Badge */}
                                    <div className={`absolute top-1 sm:top-2 w-4 sm:w-6 h-4 sm:h-6 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/10 text-[8px] font-bold opacity-60 ${isEn ? 'left-1 sm:left-2' : 'right-1 sm:right-2'}`}>
                                        {item.id}
                                    </div>
                                    
                                    <div className="flex flex-col items-center justify-center flex-1 w-full">
                                        <h3 className="text-lg sm:text-2xl font-bold font-quran leading-none group-hover:scale-110 transition-transform duration-300" style={{ color: 'var(--text-color)' }}>
                                            {item.name}
                                        </h3>
                                        <span className={`${isEn ? 'text-[16px] sm:text-[20px] font-semibold' : 'text-[9px] sm:text-[11px]'} opacity-90 mt-1 font-cairo`}>
                                            {item.transliteration}
                                        </span>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    ) : (
                        /* List View */
                        <div className="max-w-3xl mx-auto space-y-4">
                            {filteredNames.map((item) => (
                                <div
                                    key={item.id}
                                    className="themed-card p-4 sm:p-5 pb-3 rounded-2xl border relative overflow-hidden group transition-all duration-300 shadow-sm"
                                    style={{ 
                                        borderColor: cardBorderColor, 
                                        borderWidth: '1.5px', 
                                        borderStyle: 'solid', 
                                        color: 'var(--text-color)' 
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span 
                                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold shadow-xs" 
                                            style={{ backgroundColor: theme.palette[1] + '25', color: theme.palette[1] }}
                                        >
                                            {item.transliteration}
                                        </span>
                                        <div 
                                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shadow-xs"
                                            style={
                                                isDefaultTheme 
                                                ? { backgroundColor: '#ffffff', color: '#000000', border: '1px solid rgba(0,0,0,0.1)' } 
                                                : { backgroundImage: `linear-gradient(to bottom right, ${theme.palette[0]}, ${theme.palette[1]})`, color: theme.name === 'اسود' ? '#000000' : '#ffffff' }
                                            }
                                        >
                                            {isEn ? item.id : toArabicNumerals(item.id)}
                                        </div>
                                    </div>

                                    <h3 
                                        onClick={() => setSelectedName(item)}
                                        className="text-2xl sm:text-3xl font-bold font-quran text-center mb-2.5 cursor-pointer hover:opacity-80 transition-opacity" 
                                        style={{ color: 'var(--text-color)' }}
                                    >
                                        {item.name}
                                    </h3>

                                    <p className={`text-sm sm:text-base leading-relaxed text-center select-none mb-3 px-1 ${isEn ? 'font-sans' : 'font-amiri text-base sm:text-lg'}`}>
                                        {isEn ? item.meaningEn : item.meaning}
                                    </p>

                                    {(item.evidence || item.evidenceEn) && (
                                        <div className={`text-xs sm:text-sm text-center opacity-85 py-1.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 mb-3 border border-black/5 dark:border-white/5 ${isEn ? 'font-sans' : 'font-amiri'}`}>
                                            {renderEvidence(item.evidence, item.evidenceEn)}
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t" style={{ borderColor: 'var(--card-border)' }}>
                                        <span className="text-[11px] font-bold opacity-60" style={{ color: isBlackTheme ? '#FFFFFF' : (isDefaultTheme ? '#000000' : theme.palette[0]) }}>
                                            {isEn ? 'Beautiful Names of Allah' : 'من أسماء الله الحسنى'}
                                        </span>
                                        {renderActionButtons(item)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Modal: Explanation */}
            <AnimatePresence>
                {selectedName && (
                    <div 
                        className="fixed inset-0 bg-black/80 z-[100] flex justify-center items-center p-4 backdrop-blur-sm"
                        onClick={() => setSelectedName(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-modal-bg text-modal-text p-6 md:p-8 rounded-3xl w-full max-w-xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                            style={{ fontFamily: theme.font }} 
                            onClick={e => e.stopPropagation()}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            <div className="overflow-y-auto hide-scrollbar flex-1 py-2">
                                <div className="text-3xl md:text-4xl font-bold font-quran mb-3 leading-normal" style={{ color: 'var(--text-color)' }}>
                                    {selectedName.name} ({selectedName.transliteration})
                                </div>

                                <div className={`text-base md:text-lg leading-relaxed text-center mb-4 select-none px-2 ${isEn ? 'font-sans' : 'font-amiri text-lg md:text-xl'}`} style={{ color: 'var(--text-color)' }}>
                                    {isEn ? selectedName.meaningEn : selectedName.meaning}
                                </div>

                                {(selectedName.evidence || selectedName.evidenceEn) && (
                                    <div className={`text-sm md:text-base leading-relaxed text-center mb-4 opacity-90 ${isEn ? 'font-sans' : 'font-amiri text-base md:text-lg'}`}>
                                        {renderEvidence(selectedName.evidence, selectedName.evidenceEn)}
                                    </div>
                                )}

                                <p className="text-base md:text-lg mt-4 font-bold font-cairo" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                    {isEn ? 'Beautiful Names of Allah' : 'من أسماء الله الحسنى'}
                                </p>
                            </div>

                            <div className="flex justify-center items-center py-3 border-t mt-3" style={{ borderColor: 'var(--card-border)' }}>
                                {renderActionButtons(selectedName)}
                            </div>

                            <div className="mt-2 shrink-0">
                                <button 
                                    type="button"
                                    onClick={() => setSelectedName(null)} 
                                    className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer text-base"
                                >
                                    {isEn ? 'Close' : 'إغلاق'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Zoom Modal */}
            <AnimatePresence>
                {zoomedName && (
                    <div 
                        className="fixed inset-0 bg-black/85 z-[120] flex justify-center items-center p-4 backdrop-blur-md" 
                        onClick={() => setZoomedName(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-modal-bg text-modal-text p-8 rounded-3xl w-full max-w-2xl text-center relative scale-in shadow-2xl border-2 border-modal-border flex flex-col max-h-[90vh]" 
                            style={{ fontFamily: theme.font }} 
                            onClick={e => e.stopPropagation()}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            <div className="overflow-y-auto hide-scrollbar flex-1 py-4">
                                <div className="text-4xl md:text-5xl font-bold font-quran mb-4" style={{ color: 'var(--text-color)' }}>
                                    {zoomedName.name}
                                </div>
                                <p className={`text-xl md:text-2xl leading-loose text-center select-none ${isEn ? 'font-sans' : 'font-amiri text-2xl md:text-3xl'}`} style={{ color: 'var(--text-color)' }}>
                                    {isEn ? zoomedName.meaningEn : zoomedName.meaning}
                                </p>
                                {(zoomedName.evidence || zoomedName.evidenceEn) && (
                                    <p className={`text-base md:text-lg mt-4 leading-relaxed opacity-90 ${isEn ? 'font-sans' : 'font-amiri text-lg md:text-xl'}`}>
                                        {renderEvidence(zoomedName.evidence, zoomedName.evidenceEn)}
                                    </p>
                                )}
                                <p className="text-lg mt-6 font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : theme.palette[0] }}>
                                    {isEn ? `Beautiful Names of Allah (#${zoomedName.id})` : `من أسماء الله الحسنى (${toArabicNumerals(zoomedName.id)})`}
                                </p>
                            </div>

                            <div className="flex justify-center items-center py-3 border-t mt-2" style={{ borderColor: 'var(--card-border)' }}>
                                {renderActionButtons(zoomedName)}
                            </div>

                            <div className="mt-2 shrink-0">
                                <button 
                                    type="button"
                                    onClick={() => setZoomedName(null)} 
                                    className="w-full py-3 rounded-xl font-bold bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer text-base"
                                >
                                    {isEn ? 'Close' : 'إغلاق'}
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
