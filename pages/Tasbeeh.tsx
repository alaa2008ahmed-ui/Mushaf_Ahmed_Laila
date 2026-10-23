import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { toEnglishNumerals } from '../utils/tasbeehUtils';
import { DEFAULT_PHRASES } from '../data/tasbeehData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import TasbeehHeader from '../components/Tasbeeh/TasbeehHeader';
import TasbeehControls from '../components/Tasbeeh/TasbeehControls';
import TasbeehCounter from '../components/Tasbeeh/TasbeehCounter';
import ThreeDButton from '../components/Tasbeeh/ThreeDButton';
import TasbeehModals from '../components/Tasbeeh/TasbeehModals';
import { BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { tTasbeeh, getPhraseDisplay } from '../utils/tasbeehTranslations';
import { CommunitySpotlightGuide, getGuideSeen } from '../components/Community/CommunitySpotlightGuide';
import { TASBEEH_PAGE_STEPS } from '../components/Community/communityTourSteps';
import { markPageAsSeen } from '../utils/badgeManager';

const PHRASES_STORAGE_KEY = 'mushaf_user_tasbeeh_phrases';
const SETTINGS_STORAGE_KEY = 'mushaf_tasbeeh_settings';

// Web Audio API for simple clicks
let audioCtx: AudioContext | null = null;
const playSound = (freq = 800, duration = 0.05) => {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        // Audio might fail if not allowed by browser yet
    }
};

const vibrate = (pattern: number | number[] = 40) => {
    if (navigator.vibrate) {
        try {
            navigator.vibrate(pattern);
        } catch (e) {}
    }
};

interface TasbeehProps {
    onBack: () => void;
    onNavigate: (pageId: string, params?: any) => void;
}

export function Tasbeeh({ onBack, onNavigate }: TasbeehProps) {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    
    // Counter Colors and Themes
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'اسود' || theme.name === 'black';
    const isWhiteTheme = theme.bgColor === '#FFFFFF' || theme.name === 'ابيض' || theme.name === 'white';
    const isBlackAndWhite = isBlackTheme || isWhiteTheme;
    const isDefaultTheme = themeKey === 'default' || !themeKey;

    const primaryTextColor = theme.palette[0] || '#10b981';
    const secondaryTextColor = theme.palette[1] || '#059669';
    const cardBorderColor = isDefaultTheme ? '#000000' : (isBlackTheme ? '#FFFFFF' : (theme.palette?.[0] || '#000000'));

    const [phrases, setPhrases] = useState(DEFAULT_PHRASES);
    const [activePhrase, setActivePhrase] = useState(DEFAULT_PHRASES[0].text);
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [isCountingStopped, setIsCountingStopped] = useState(false);
    const [skin, setSkin] = useState<'modern' | 'classic' | 'beads'>('modern');
    const [dailyStats, setDailyStats] = useState<{date: string, count: number}[]>([]);

    const getDefaultCounterColor = useCallback(() => {
        return themeKey === 'default' ? '#000000' : (isBlackTheme ? '#FFFFFF' : theme.palette[0]);
    }, [themeKey, isBlackTheme, theme.palette]);

    const [counterColor, setCounterColor] = useState(getDefaultCounterColor);

    const [modals, setModals] = useState({
        target: false,
        phrase: false,
        add: false,
        delete: false,
        color: false,
        stats: false,
        skins: false,
    });

    const [message, setMessage] = useState({ text: '', type: 'green', visible: false });
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        markPageAsSeen('tasbeeh');
        if (!getGuideSeen('tasbeeh_page_spotlight')) {
            setShowGuide(true);
        }
    }, []);
    
    const targetInputRef = useRef<HTMLInputElement>(null);
    const newPhraseInputRef = useRef<HTMLInputElement>(null);
    const prevThemeKeyRef = useRef(themeKey);

    useEffect(() => {
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const defaultCol = getDefaultCounterColor();
            let finalColor = defaultCol;

            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                if (prevThemeKeyRef.current !== themeKey) {
                    finalColor = defaultCol;
                    settings.counterColor = finalColor;
                    settings.lastThemeKey = themeKey;
                    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
                } else if (settings.counterColor) {
                    finalColor = settings.counterColor;
                }

                if (settings.skin) setSkin(settings.skin);
                if (settings.dailyStats) setDailyStats(settings.dailyStats);
            } else {
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ 
                    counterColor: finalColor, 
                    lastThemeKey: themeKey 
                }));
            }
            
            setCounterColor(finalColor);
        } catch(e) {
            console.error("Error loading tasbeeh settings", e);
        }

        prevThemeKeyRef.current = themeKey;
    }, [themeKey, theme, getDefaultCounterColor]);

    const activeCounterColor = counterColor;

    const loadPhrases = useCallback(() => {
        try {
            const stored = localStorage.getItem(PHRASES_STORAGE_KEY);
            const userChanges = stored ? JSON.parse(stored) : [];
            const deletedTexts = userChanges.filter((c: any) => c.deleted).map((c: any) => c.text);
            const addedPhrases = userChanges.filter((c: any) => !c.deleted);

            let currentPhrases = DEFAULT_PHRASES.filter(p => !deletedTexts.includes(p.text));
            addedPhrases.forEach((p: any) => {
                if (!currentPhrases.some(cp => cp.text === p.text)) {
                    currentPhrases.push({ id: Date.now() + Math.random(), text: p.text });
                }
            });
            
            setPhrases(currentPhrases);
            if (!currentPhrases.some(p => p.text === activePhrase)) {
                setActivePhrase(currentPhrases[0]?.text || '');
            }

        } catch (e) {
            setPhrases(DEFAULT_PHRASES);
            setActivePhrase(DEFAULT_PHRASES[0]?.text || '');
        }
    }, [activePhrase]);

    useEffect(() => {
        loadPhrases();
    }, [loadPhrases]);

    useEffect(() => {
        const interceptor = () => {
            if (modals.target || modals.phrase || modals.add || modals.delete || modals.color || modals.stats || modals.skins) {
                setModals({ target: false, phrase: false, add: false, delete: false, color: false, stats: false, skins: false });
                return true;
            }
            return false;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [modals]);

    useEffect(() => {
        (window as any).handleNextPhrase = () => {
             const currentIndex = phrases.findIndex(p => p.text === activePhrase);
             if (currentIndex >= 0 && currentIndex < phrases.length - 1) {
                 setActivePhrase(phrases[currentIndex + 1].text);
                 handleReset();
             } else if (phrases.length > 0) {
                 setActivePhrase(phrases[0].text);
                 handleReset();
             }
        };
        (window as any).handlePrevPhrase = () => {
             const currentIndex = phrases.findIndex(p => p.text === activePhrase);
             if (currentIndex > 0) {
                 setActivePhrase(phrases[currentIndex - 1].text);
                 handleReset();
             } else if (phrases.length > 0) {
                 setActivePhrase(phrases[phrases.length - 1].text);
                 handleReset();
             }
        };
        return () => {
            delete (window as any).handleNextPhrase;
            delete (window as any).handlePrevPhrase;
        };
    }, [phrases, activePhrase]);

    const showMessage = (text: string, type = 'green') => {
        setMessage({ text, type, visible: true });
        setTimeout(() => setMessage(prev => ({ ...prev, visible: false })), 2000);
    };

    const handleIncrement = () => {
        if (isCountingStopped) {
            return;
        }
        playSound();
        vibrate(30);
        const newCount = count + 1;

        // Update daily stats
        const today = new Date().toISOString().split('T')[0];
        setDailyStats(prev => {
            const newStats = [...prev];
            const todayStatIndex = newStats.findIndex(s => s.date === today);
            if (todayStatIndex >= 0) {
                newStats[todayStatIndex].count += 1;
            } else {
                newStats.push({ date: today, count: 1 });
            }
            try {
                const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
                const settings = savedSettings ? JSON.parse(savedSettings) : {};
                settings.dailyStats = newStats;
                localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
            } catch (e) {}
            return newStats;
        });

        if (target > 0 && newCount >= target) {
            setCount(target);
            setIsCountingStopped(true);
            vibrate([100, 50, 100]);
            playSound(660, 0.2);
            showMessage(tTasbeeh('targetReached', language));
        } else {
            setCount(newCount);
        }
    };
    
    const handleReset = () => {
        setCount(0);
        setIsCountingStopped(false);
    };

    const saveChanges = (currentPhrases: {id: number, text: string}[]) => {
        try {
            const deletedDefaults = DEFAULT_PHRASES.filter(dp => !currentPhrases.some(cp => cp.text === dp.text)).map(p => ({ text: p.text, deleted: true }));
            const addedUserPhrases = currentPhrases.filter(cp => !DEFAULT_PHRASES.some(dp => dp.text === cp.text));
            localStorage.setItem(PHRASES_STORAGE_KEY, JSON.stringify([...deletedDefaults, ...addedUserPhrases]));
            loadPhrases();
        } catch (e) { console.error("Failed to save tasbeeh phrases", e); }
    };
    
    const handleAddPhrase = (newPhraseText: string) => {
        const trimmed = newPhraseText.trim();
        if (!trimmed) { showMessage(tTasbeeh('cannotAddEmpty', language), 'red'); return; }
        if (phrases.some(p => p.text === trimmed)) { showMessage(tTasbeeh('phraseExists', language), 'red'); return; }
        
        const newPhrases = [...phrases, { id: Date.now(), text: trimmed }];
        saveChanges(newPhrases);
        setActivePhrase(trimmed);
        handleReset();
        setModals(p => ({...p, add: false, phrase: false}));
        showMessage(tTasbeeh('phraseAdded', language));
    };
    
    const handleDeletePhrase = (phraseText: string) => {
        const newPhrases = phrases.filter(p => p.text !== phraseText);
        saveChanges(newPhrases);

        if (activePhrase === phraseText) {
            const nextPhrase = newPhrases.length > 0 ? newPhrases[0].text : (DEFAULT_PHRASES[0]?.text || '');
            setActivePhrase(nextPhrase);
            handleReset();
        }
        showMessage(tTasbeeh('phraseDeleted', language));
    };

    const handleSetTarget = () => {
        const newTargetValue = targetInputRef.current?.value || '0';
        const num = parseInt(toEnglishNumerals(newTargetValue), 10);
        const newTarget = isNaN(num) || num < 0 ? 0 : num;
        handleReset();
        setTarget(newTarget);
        setModals(p => ({...p, target: false}));
    };
    
    const handleSetCounterColor = (color: string) => {
        setCounterColor(color);
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.counterColor = color;
            settings.lastThemeKey = themeKey;
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save counter color", e);
        }
        showMessage(tTasbeeh('colorChanged', language));
        setModals(p => ({...p, color: false}));
    };

    const handleSetSkin = (newSkin: 'modern' | 'classic' | 'beads') => {
        setSkin(newSkin);
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.skin = newSkin;
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save skin", e);
        }
        showMessage(tTasbeeh('skinChanged', language));
        setModals(p => ({...p, skins: false}));
    };

    const colorOptions = [
        themeKey === 'default' ? '#FFFFFF' : theme.palette[0],
        themeKey === 'default' ? theme.palette[0] : '#FFFFFF',
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // green
        '#f59e0b', // amber
        '#8b5cf6', // violet
        '#ec4899', // pink
    ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 8);

    const handleBack = () => {
        if (Object.values(modals).some(Boolean)) {
            setModals({ target: false, phrase: false, add: false, delete: false, color: false, stats: false, skins: false });
        } else {
            onBack();
        }
    };

    const handleGoHome = () => {
        if (Object.values(modals).some(Boolean)) {
            setModals({ target: false, phrase: false, add: false, delete: false, color: false, stats: false, skins: false });
        }
        onNavigate('home');
    };

    return (
        <div className="h-screen h-[100dvh] max-h-screen max-h-[100dvh] flex flex-col bg-transparent overflow-hidden" dir={dir}>
            <TasbeehHeader 
                title={tTasbeeh('title', language)} 
                subtitle={tTasbeeh('subtitle', language)} 
                onBack={handleBack}
                onHome={handleGoHome}
                onOpenGuide={() => setShowGuide(true)}
            />
            
            <main 
                className="px-4 flex-1 min-h-0 relative flex flex-col items-center overflow-y-auto overscroll-contain fade-in pb-6"
            >
                 <TasbeehControls 
                    isBlackAndWhite={isBlackAndWhite}
                    theme={theme}
                    secondaryTextColor={secondaryTextColor}
                    activePhrase={activePhrase}
                    setModals={setModals}
                    cardBorderColor={cardBorderColor}
                 />

                 <TasbeehCounter 
                    isCountingStopped={isCountingStopped}
                    target={target}
                    secondaryTextColor={secondaryTextColor}
                    primaryTextColor={primaryTextColor}
                    counterColor={activeCounterColor}
                    count={count}
                    handleIncrement={handleIncrement}
                    isBlackAndWhite={isBlackAndWhite}
                    skin={skin}
                    isDefaultTheme={themeKey === 'default'}
                    theme={theme}
                    cardBorderColor={cardBorderColor}
                 />
                
                <div className="w-full max-w-lg px-4 mt-6 mb-0">
                    <div className="grid grid-cols-2 gap-3">
                        <ThreeDButton 
                            label={tTasbeeh('reset', language)} 
                            onClick={handleReset} 
                            color={isBlackAndWhite ? '#333' : theme.palette[1]} 
                            padding="py-2.5 text-base" 
                            theme={theme} 
                            cardBorderColor={cardBorderColor}
                        />
                        <ThreeDButton 
                            label={tTasbeeh('editTarget', language)} 
                            onClick={() => setModals(p => ({...p, target: true}))} 
                            color={isBlackAndWhite ? '#000' : theme.palette[0]} 
                            padding="py-2.5 text-base" 
                            theme={theme} 
                            cardBorderColor={cardBorderColor}
                        />
                    </div>

                    {/* Quick Chart Trigger Card */}
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setModals(p => ({...p, stats: true}))}
                        className="w-full mt-2.5 p-2.5 px-3.5 rounded-2xl themed-card shadow-sm flex items-center justify-between text-xs transition-all hover:shadow-md active:scale-95 group"
                        style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}
                    >
                        <div className="flex items-center gap-2 font-bold">
                            <span className="p-1.5 rounded-lg bg-black/5 dark:bg-white/10 text-amber-500">
                                <BarChart3 className="w-4 h-4" />
                            </span>
                            <span className="font-bold" style={{ color: isBlackTheme ? '#FFFFFF' : (theme.textColor || '#111827') }}>
                                {tTasbeeh('chartTitle', language)}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold" style={{ color: primaryTextColor }}>
                            <span className="text-[11px] opacity-80">
                                {tTasbeeh('weeklyMonthly', language)}
                            </span>
                            {isRTL ? (
                                <ChevronLeft className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-[-2px] transition-transform" />
                            ) : (
                                <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-[2px] transition-transform" />
                            )}
                        </div>
                    </motion.button>
                </div>
            </main>
            
            {/* Modals */}
            <TasbeehModals 
                modals={modals}
                setModals={setModals}
                targetInputRef={targetInputRef}
                target={target}
                handleSetTarget={handleSetTarget}
                newPhraseInputRef={newPhraseInputRef}
                handleAddPhrase={handleAddPhrase}
                phrases={phrases}
                handleDeletePhrase={handleDeletePhrase}
                activePhrase={activePhrase}
                setActivePhrase={setActivePhrase}
                handleReset={handleReset}
                colorOptions={colorOptions}
                handleSetCounterColor={handleSetCounterColor}
                counterColor={activeCounterColor}
                theme={theme}
                dailyStats={dailyStats}
                skin={skin}
                handleSetSkin={handleSetSkin}
                themeKey={themeKey}
                cardBorderColor={cardBorderColor}
                onNavigate={onNavigate}
            />

            <AnimatePresence>
                {message.visible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 10, x: '-50%' }}
                        className={`fixed bottom-8 left-1/2 p-3 text-white rounded-lg shadow-xl z-[200] font-bold ${message.type === 'green' ? (isBlackTheme ? 'bg-white text-black' : 'bg-emerald-500') : 'bg-red-500'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Spotlight Guide */}
            <CommunitySpotlightGuide 
                guideKey="tasbeeh_page_spotlight"
                steps={TASBEEH_PAGE_STEPS}
                isOpen={showGuide}
                onClose={() => setShowGuide(false)}
                isEn={language === 'en'}
            />
        </div>
    );
}

export default Tasbeeh;