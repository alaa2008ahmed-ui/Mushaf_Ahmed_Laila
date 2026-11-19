import React, { useState, useEffect, useMemo } from 'react';
import { registerBackInterceptor } from '../hooks/useBackButton';
import { asmaulHusna, AsmaulHusnaItem } from '../data/asmaulHusnaData';
import { Search, LayoutGrid, ListFilter, X, Volume2, Share2, Copy, ZoomIn, ChevronDown, Check } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { shareAsImage } from '../utils/shareAsImage';
import { playTTS, stopTTS, subscribeTTS } from '../utils/ttsEngine';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { ASMAUL_HUSNA_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';
import { getModernFlatTokens, hexToRgba } from '../utils/flatDesignTokens';
import { getToast3DStyles } from '../utils/toast3DStyles';

const toArabicNumerals = (num: number) => String(num).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);

const AsmaulHusna: React.FC<{ onBack: () => void, onNavigate: (id: string, params?: any) => void; navParams?: any; }> = ({ onBack, onNavigate, navParams }) => {
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const toast3D = getToast3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
    const { language } = useLanguage();
    const isEn = language === 'en';
    const innerSubBoxClass = `app-inner-3d-box border-0 ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#0F172A]/85'}`;

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
            <div className="flex items-center gap-2 overflow-visible" dir="ltr">
                {/* Audio */}
                <button 
                    type="button"
                    onClick={(e) => handlePlayAudio(item, e)} 
                    className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                    style={{ color: isPlaying ? '#ef4444' : 'var(--text-color)' }} 
                    title={isPlaying ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                    aria-label="Audio"
                >
                    <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-red-500 animate-pulse' : ''}`} />
                </button>

                {/* Share */}
                <button 
                    type="button"
                    onClick={(e) => handleShare(item, e)} 
                    className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                    style={{ color: 'var(--text-color)' }} 
                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                    aria-label="Share"
                >
                    <Share2 className="w-4 h-4" />
                </button>

                {/* Copy */}
                <button 
                    type="button"
                    onClick={(e) => handleCopy(item, e)} 
                    className="app-page-card border-0 w-9 h-9 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                    style={{ color: 'var(--text-color)' }} 
                    title={isEn ? "Copy" : "نسخ"}
                    aria-label="Copy"
                >
                    <Copy className="w-4 h-4" />
                </button>
            </div>
        );
    };

    return (
        <div className="h-[100dvh] flex flex-col overflow-hidden relative" style={{ backgroundColor: tokens.pageBgColor, color: tokens.textColor, fontFamily: isEn ? 'sans-serif' : "'Cairo', sans-serif" }} dir={isEn ? 'ltr' : 'rtl'}>
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

            {/* Controls Bar: Switch between Grid and List view + Search */}
            <div className="mb-4 pt-1 px-4 max-w-3xl mx-auto w-full flex items-center gap-2.5 z-10 shrink-0 overflow-visible" dir={isEn ? 'ltr' : 'rtl'}>
                {/* Search Input */}
                <div 
                    className={`app-page-card border-0 relative flex-1 rounded-2xl ${tokens.isDeepBlack ? 'bg-[#18181b]' : 'bg-white dark:bg-[#1E293B]'} flex items-center overflow-visible transition-all focus-within:ring-2 focus-within:ring-opacity-40`}
                    style={{ '--tw-ring-color': tokens.primaryColor } as any}
                >
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={isEn ? "Search by name or meaning..." : "ابحث بالاسم أو المعنى..."}
                        className={`w-full bg-transparent py-3 text-sm sm:text-base border-0 outline-none ${isEn ? 'pl-12 pr-12 text-left font-sans' : 'pr-12 pl-12 text-right font-cairo'} focus:outline-none placeholder-gray-400 dark:placeholder-gray-500`}
                        style={{ color: 'var(--text-color)' }}
                    />
                    <span
                        className={`app-3d-badge border-0 absolute ${isEn ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center pointer-events-none`}
                        style={{
                            backgroundColor: tokens.isDeepBlack ? 'rgba(255, 255, 255, 0.1)' : hexToRgba(tokens.primaryColor, 0.12),
                            color: tokens.isDeepBlack ? '#FFFFFF' : tokens.primaryColor,
                        }}
                        aria-hidden="true"
                    >
                        <i className="fa-solid fa-magnifying-glass text-xs"></i>
                    </span>
                    {searchQuery && (
                        <button 
                            type="button"
                            onClick={() => setSearchQuery('')}
                            className={`app-page-card unified-3d-btn border-0 absolute ${isEn ? 'right-2.5' : 'left-2.5'} top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-white dark:bg-[#1E293B] flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white cursor-pointer`}
                            title={isEn ? "Clear search" : "مسح البحث"}
                            aria-label={isEn ? "Clear search" : "مسح البحث"}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* View Switcher: Grid vs List */}
                <div 
                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center p-1.5 rounded-2xl gap-1.5 shrink-0 overflow-visible"
                >
                    <button
                        type="button"
                        onClick={() => setActiveTab('grid')}
                        className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'grid' ? '' : 'opacity-70 hover:opacity-100'}`}
                        style={activeTab === 'grid' ? {
                            backgroundColor: tokens.primaryColor,
                            color: tokens.themeActiveTextColor
                        } : { color: 'var(--text-color)' }}
                        title={isEn ? "Grid View" : "عرض شبكي"}
                    >
                        <LayoutGrid size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('list')}
                        className={`app-page-card border-0 bg-white dark:bg-[#1E293B] flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'list' ? '' : 'opacity-70 hover:opacity-100'}`}
                        style={activeTab === 'list' ? {
                            backgroundColor: tokens.primaryColor,
                            color: tokens.themeActiveTextColor
                        } : { color: 'var(--text-color)' }}
                        title={isEn ? "List View" : "عرض القوائم"}
                    >
                        <ListFilter size={16} />
                    </button>
                </div>
            </div>

            <main className="flex-1 min-h-0 overflow-hidden flex flex-col px-4 z-10">
                <div className="flex-1 min-h-0 overflow-y-auto hide-scrollbar pt-1.5 app-scroll-safe">
                    {filteredNames.length === 0 ? (
                        <div className="app-page-card border-0 bg-white dark:bg-[#1E293B] rounded-[18px] py-16 px-6 text-center max-w-xl mx-auto opacity-80 font-bold">
                            <Search className="w-10 h-10 mb-3 mx-auto opacity-40" />
                            <p>{isEn ? 'No matching results found' : 'لا توجد نتائج مطابقة لبحثك'}</p>
                        </div>
                    ) : activeTab === 'grid' ? (
                        /* Grid View - Embossed 3D Cards */
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-w-4xl mx-auto pb-2">
                            {filteredNames.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setSelectedName(item)}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] relative rounded-[18px] p-3 flex flex-col items-center justify-center text-center aspect-square group transition-all overflow-visible cursor-pointer"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    {/* ID Badge */}
                                    <div 
                                        className={`app-3d-badge absolute top-2.5 w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${isEn ? 'left-2.5' : 'right-2.5'}`}
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
                                                <h3 className="text-lg sm:text-xl font-bold font-sans leading-tight group-hover:scale-105 transition-transform duration-300" style={{ color: 'var(--text-color)' }}>
                                                    {item.transliteration}
                                                </h3>
                                                <span className="text-xs sm:text-sm font-cairo opacity-75 mt-1 truncate max-w-full px-1" style={{ color: tokens.subtextColor }}>
                                                    {item.name}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <h3 className="text-xl sm:text-2xl font-bold font-cairo leading-tight group-hover:scale-105 transition-transform duration-300" style={{ color: 'var(--text-color)' }}>
                                                    {item.name}
                                                </h3>
                                                <span className="text-[10px] sm:text-xs font-semibold opacity-80 mt-1 truncate max-w-full px-1 font-cairo" style={{ color: tokens.subtextColor }}>
                                                    {item.transliteration}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        /* List View - Embossed 3D Cards */
                        <div className="max-w-3xl mx-auto space-y-3.5 pb-2">
                            {filteredNames.map((item) => (
                                <div
                                    key={item.id}
                                    className="app-page-card border-0 bg-white dark:bg-[#1E293B] p-5 rounded-[18px] relative overflow-visible group transition-all duration-300"
                                    style={{ color: 'var(--text-color)' }}
                                >
                                    <div className="flex justify-between items-center mb-3">
                                        <span 
                                            className="app-3d-badge inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-0" 
                                            style={{ 
                                                backgroundColor: hexToRgba(tokens.primaryColor, 0.1), 
                                                color: tokens.primaryColor 
                                            }}
                                        >
                                            {item.transliteration}
                                        </span>
                                        <div 
                                            className="app-3d-badge w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs"
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
                                            <h3 className="text-3xl sm:text-4xl font-bold font-sans" style={{ color: 'var(--text-color)' }}>
                                                {item.transliteration}
                                            </h3>
                                            <span className="text-base sm:text-lg font-cairo opacity-75 mt-1 block" style={{ color: tokens.subtextColor }}>
                                                {item.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <h3 
                                            onClick={() => setSelectedName(item)}
                                            className="text-2xl sm:text-3xl font-bold font-cairo text-center mb-2.5 cursor-pointer hover:opacity-80 transition-opacity" 
                                            style={{ color: 'var(--text-color)' }}
                                        >
                                            {item.name}
                                        </h3>
                                    )}

                                    <p className={`leading-[2.2] text-center select-none mb-3 px-2 ${isEn ? 'font-sans text-base sm:text-lg md:text-xl' : 'font-cairo text-xs sm:text-sm'}`} style={{ color: tokens.subtextColor }}>
                                        {isEn ? item.meaningEn : item.meaning}
                                    </p>

                                    <div className="flex justify-between items-center mt-3 pt-3 app-3d-divider-top overflow-visible">
                                        <span className="text-xs font-bold opacity-70" style={{ color: tokens.primaryColor }}>
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

            {/* Modal Bottom Sheet: Full Details & Big Typography */}
                {selectedName && (
                    <div 
                        className="fixed inset-0 bg-black/65 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
                        onClick={() => setSelectedName(null)}
                    >
                        <div 
                            className="app-page-card border-0 rounded-t-[28px] sm:rounded-[24px] w-full max-w-xl text-center relative flex flex-col max-h-[88dvh] overflow-hidden bg-white dark:bg-[#1E293B]" 
                            style={{ 
                                color: 'var(--text-color)',
                                fontFamily: isEn ? 'sans-serif' : "'Cairo', sans-serif" 
                            }} 
                            onClick={e => e.stopPropagation()}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            {/* Drag handle */}
                            <div className="pt-3 pb-1 flex justify-center sm:hidden">
                                <div className="app-3d-drag-handle w-12 h-1.5 rounded-full bg-slate-300 dark:bg-zinc-700" />
                            </div>

                            {/* Header without X button */}
                            <div className="flex items-center justify-center px-5 pt-3 pb-2">
                                <span 
                                    className="app-3d-badge px-3.5 py-1 rounded-full text-xs font-bold"
                                    style={{ 
                                        backgroundColor: hexToRgba(tokens.primaryColor, 0.1),
                                        color: tokens.primaryColor
                                    }}
                                >
                                    {isEn ? `#${selectedName.id}` : `الاسم ${toArabicNumerals(selectedName.id)}`}
                                </span>
                            </div>

                            <div className="overflow-y-auto hide-scrollbar flex-1 min-h-0 px-6 py-3 space-y-4">
                                <div>
                                    {isEn ? (
                                        <>
                                            <h2 className="text-4xl sm:text-5xl font-bold font-sans mb-1 leading-normal" style={{ color: 'var(--text-color)' }}>
                                                {selectedName.transliteration}
                                            </h2>
                                            <span className="text-lg sm:text-xl font-cairo opacity-75 block" style={{ color: tokens.primaryColor }}>
                                                {selectedName.name}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <h2 className="text-4xl sm:text-5xl font-bold font-cairo mb-1 leading-normal" style={{ color: 'var(--text-color)' }}>
                                                {selectedName.name}
                                            </h2>
                                            <span className="text-sm font-semibold opacity-80 font-cairo" style={{ color: tokens.primaryColor }}>
                                                {selectedName.transliteration}
                                            </span>
                                        </>
                                    )}
                                </div>

                                <div 
                                    className={`p-4 sm:p-5 rounded-[18px] leading-[2.3] text-center ${innerSubBoxClass} ${isEn ? 'font-sans' : 'font-cairo'}`}
                                    style={{ 
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
                                        className={`p-4 rounded-[18px] leading-[2.2] text-center ${innerSubBoxClass} ${isEn ? 'font-sans' : 'font-cairo'}`}
                                        style={{ 
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

                            {/* Footer Actions with dynamic safe-area bottom elevation */}
                            <div 
                                className="p-4 pt-3 modal-sheet-safe-bottom shrink-0 app-3d-divider-top flex justify-center items-center gap-3 sm:gap-4 overflow-visible"
                            >
                                {/* Audio */}
                                <button 
                                    type="button"
                                    onClick={(e) => handlePlayAudio(selectedName, e)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                                    style={{ color: playingText === getAudioText(selectedName) ? '#ef4444' : 'var(--text-color)' }} 
                                    title={playingText === getAudioText(selectedName) ? (isEn ? "Stop Audio" : "إيقاف الاستماع") : (isEn ? "Play Audio" : "استماع صوتي")}
                                >
                                    <Volume2 className={`w-5 h-5 ${playingText === getAudioText(selectedName) ? 'text-red-500 animate-pulse' : ''}`} />
                                </button>

                                {/* Share */}
                                <button 
                                    type="button"
                                    onClick={(e) => handleShare(selectedName, e)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                                    style={{ color: 'var(--text-color)' }} 
                                    title={isEn ? "Share as Image" : "مشاركة كصورة"}
                                >
                                    <Share2 className="w-5 h-5" />
                                </button>

                                {/* Copy */}
                                <button 
                                    type="button"
                                    onClick={(e) => handleCopy(selectedName, e)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                                    style={{ color: 'var(--text-color)' }} 
                                    title={isEn ? "Copy" : "نسخ"}
                                >
                                    <Copy className="w-5 h-5" />
                                </button>

                                {/* Zoom */}
                                <button 
                                    type="button"
                                    onClick={handleToggleFontZoom} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                                    style={{ color: 'var(--text-color)' }} 
                                    title={isEn ? "Zoom Font" : "تكبير الخط"}
                                >
                                    <ZoomIn className="w-5 h-5" />
                                </button>

                                {/* ChevronDown to hide modal */}
                                <button 
                                    type="button"
                                    onClick={() => setSelectedName(null)} 
                                    className="app-page-card border-0 w-11 h-11 rounded-full flex items-center justify-center bg-white dark:bg-[#1E293B] transition-all cursor-pointer shrink-0" 
                                    style={{ color: 'var(--text-color)' }} 
                                    title={isEn ? "Hide list" : "إخفاء القائمة"}
                                >
                                    <ChevronDown className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* Toast Notification */}
                {toastMessage && (
                    <div 
                        className="app-3d-toast fixed bottom-[calc(var(--app-bottom-clearance,0px)+1rem)] left-1/2 -translate-x-1/2 z-[200] max-w-[85vw] w-max px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-center leading-normal break-words flex items-center justify-center gap-2.5 pointer-events-none"
                        style={toast3D.style}
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
