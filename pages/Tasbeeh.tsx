
import React, { useState, useEffect, useCallback, useRef } from 'react';
import BottomBar from '../components/BottomBar';
import { useTheme } from '../context/ThemeContext';
import { DEFAULT_PHRASES } from '../data/tasbeehData';
import { registerBackInterceptor } from '../hooks/useBackButton';
import ThreeDButton from '../components/Tasbeeh/ThreeDButton';
import ModalWrapper from '../components/Tasbeeh/ModalWrapper';
import TasbeehHeader from '../components/Tasbeeh/TasbeehHeader';
import TasbeehControls from '../components/Tasbeeh/TasbeehControls';
import TasbeehCounter from '../components/Tasbeeh/TasbeehCounter';
import TasbeehModals from '../components/Tasbeeh/TasbeehModals';
import { toArabicNumerals, toEnglishNumerals, playSound, vibrate } from '../utils/tasbeehUtils';
import { motion, AnimatePresence } from 'framer-motion';

// FIX: Renamed to be more specific to phrases
const PHRASES_STORAGE_KEY = 'ahmed_laila_tasbeeh_phrases';
// FIX: Added a new key for other settings like color
const SETTINGS_STORAGE_KEY = 'ahmed_laila_tasbeeh_settings_v1';

// --- Main Component ---
function Tasbeeh({ onBack, onNavigate }) {
    const { theme, themeKey } = useTheme();
    const isBlackAndWhite = themeKey === 'deep_black';
    const isBlackTheme = theme.bgColor === '#000000';
    const primaryTextColor = isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[0]));
    const secondaryTextColor = isBlackTheme ? '#FFFFFF' : (themeKey === 'default' ? '#000000' : (isBlackAndWhite ? '#FFFFFF' : theme.palette[1]));

    const getDefaultCounterColor = useCallback((tKey: string, tObj: any) => {
        return tKey === 'default' ? '#FFFFFF' : tObj.palette[0];
    }, []);

    const [phrases, setPhrases] = useState<{id: number, text: string}[]>([]);
    const [count, setCount] = useState(0);
    const [target, setTarget] = useState(33);
    const [activePhrase, setActivePhrase] = useState('');
    const [isCountingStopped, setIsCountingStopped] = useState(false);
    const [modals, setModals] = useState({ target: false, phrase: false, add: false, delete: false, color: false, stats: false, skins: false });
    const [message, setMessage] = useState({ text: '', type: 'green', visible: false });
    const targetInputRef = useRef<HTMLInputElement>(null);
    const newPhraseInputRef = useRef<HTMLInputElement>(null);
    
    // Initial color from theme - we'll update it in useEffect after mounting
    const [counterColor, setCounterColor] = useState(() => getDefaultCounterColor(themeKey, theme));
    const prevThemeKeyRef = useRef<string | null>(null);
    const [skin, setSkin] = useState<'modern' | 'classic' | 'beads'>('modern');
    const [dailyStats, setDailyStats] = useState<{date: string, count: number}[]>([]);

    useEffect(() => {
        // 1. Load settings and handle "Dominant Theme" logic
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            let finalColor = getDefaultCounterColor(themeKey, theme);
            
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                
                // If it's the first mount (prevThemeKeyRef is null) 
                // OR if themeKey has actually changed since last time
                const themeHasChanged = prevThemeKeyRef.current !== null && prevThemeKeyRef.current !== themeKey;
                const wasSavedWithDifferentTheme = settings.lastThemeKey && settings.lastThemeKey !== themeKey;

                if (themeHasChanged || wasSavedWithDifferentTheme || !settings.counterColor) {
                    // Use theme color if theme changed or no saved color
                    finalColor = getDefaultCounterColor(themeKey, theme);
                    
                    // Sync the change to storage immediately
                    const newSettings = { ...settings, counterColor: finalColor, lastThemeKey: themeKey };
                    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
                } else {
                    // Theme is the same, use saved manual color
                    finalColor = settings.counterColor;
                }

                if (settings.skin) setSkin(settings.skin);
                if (settings.dailyStats) setDailyStats(settings.dailyStats);
            } else {
                // No settings at all, use default and save theme key
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
    const isCounterWhite = activeCounterColor === '#FFFFFF' || activeCounterColor === 'white' || activeCounterColor === '#fff';

    const loadPhrases = useCallback(() => {
        try {
            const stored = localStorage.getItem(PHRASES_STORAGE_KEY);
            const userChanges = stored ? JSON.parse(stored) : [];
            const deletedTexts = userChanges.filter(c => c.deleted).map(c => c.text);
            const addedPhrases = userChanges.filter(c => !c.deleted);

            let currentPhrases = DEFAULT_PHRASES.filter(p => !deletedTexts.includes(p.text));
            addedPhrases.forEach(p => {
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
        // Expose functions to window for swiping in TasbeehCounter without passing them down all the way, or we can just attach them.
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
            showMessage('تم الوصول للهدف!');
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
            loadPhrases(); // Reload to ensure consistency
        } catch (e) { console.error("Failed to save tasbeeh phrases", e); }
    };
    
    const handleAddPhrase = (newPhraseText: string) => {
        const trimmed = newPhraseText.trim();
        if (!trimmed) { showMessage('لا يمكن إضافة ذكر فارغ.', 'red'); return; }
        if (phrases.some(p => p.text === trimmed)) { showMessage('هذا الذكر موجود بالفعل.', 'red'); return; }
        
        const newPhrases = [...phrases, { id: Date.now(), text: trimmed }];
        saveChanges(newPhrases);
        setActivePhrase(trimmed);
        handleReset();
        setModals(p => ({...p, add: false, phrase: false}));
        showMessage('تم إضافة الذكر بنجاح.');
    };
    
    const handleDeletePhrase = (phraseText: string) => {
        const newPhrases = phrases.filter(p => p.text !== phraseText);
        saveChanges(newPhrases);

        if (activePhrase === phraseText) {
            const nextPhrase = newPhrases.length > 0 ? newPhrases[0].text : (DEFAULT_PHRASES[0]?.text || '');
            setActivePhrase(nextPhrase);
            handleReset();
        }
        showMessage('تم حذف الذكر بنجاح.');
    };

    const handleSetTarget = () => {
        const newTargetValue = targetInputRef.current?.value || '0';
        const num = parseInt(toEnglishNumerals(newTargetValue), 10);
        const newTarget = isNaN(num) || num < 0 ? 0 : num;
        handleReset();
        setTarget(newTarget);
        setModals(p => ({...p, target: false}));
    };
    
    // FIX: New function to handle setting and saving the counter color.
    const handleSetCounterColor = (color: string) => {
        setCounterColor(color);
        try {
            const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
            const settings = savedSettings ? JSON.parse(savedSettings) : {};
            settings.counterColor = color;
            settings.lastThemeKey = themeKey; // Save current theme key with this color
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        } catch (e) {
            console.error("Failed to save counter color", e);
        }
        showMessage('تم تغيير لون العداد.');
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
        showMessage('تم تغيير شكل السبحة.');
        setModals(p => ({...p, skins: false}));
    };

    // FIX: A list of predefined distinct color options for the color picker modal.
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

    const handleHomeClick = () => {
        if (Object.values(modals).some(Boolean)) {
            setModals({ target: false, phrase: false, add: false, delete: false, color: false, stats: false, skins: false });
        } else {
            onBack();
        }
    };

    return (
        <div className="h-screen flex flex-col bg-transparent">
            <TasbeehHeader title="السبحة الإلكترونية" subtitle="أضف أذكارك الخاصة وتتبع تسبيحك بدقة" />
            
            <main className="px-4 pb-4 flex-grow relative flex flex-col items-center overflow-y-auto fade-in">
                 <TasbeehControls 
                    isBlackAndWhite={isBlackAndWhite}
                    theme={theme}
                    secondaryTextColor={secondaryTextColor}
                    activePhrase={activePhrase}
                    setModals={setModals}
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
                 />
                
                <div className="w-full max-w-lg px-4 mt-auto mb-2">
                    <div className="grid grid-cols-2 gap-3">
                        <ThreeDButton label="تصفير" onClick={handleReset} color={isBlackAndWhite ? '#333' : theme.palette[1]} padding="py-2.5 text-base" theme={theme}>
                            {/* No children */}
                        </ThreeDButton>
                        <ThreeDButton label="تعديل الهدف" onClick={() => setModals(p => ({...p, target: true}))} color={isBlackAndWhite ? '#000' : theme.palette[0]} padding="py-2.5 text-base" theme={theme}>
                             {/* No children */}
                        </ThreeDButton>
                    </div>
                </div>
                <div className="w-full h-24 shrink-0"></div>
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
            />

            <AnimatePresence>
                {message.visible && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20, x: '-50%' }}
                        animate={{ opacity: 1, y: 0, x: '-50%' }}
                        exit={{ opacity: 0, y: 10, x: '-50%' }}
                        className={`fixed bottom-24 left-1/2 p-3 text-white rounded-lg shadow-xl z-[200] font-bold ${message.type === 'green' ? (isBlackTheme ? 'bg-white text-black' : 'bg-emerald-500') : 'bg-red-500'}`}
                    >
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>

            <BottomBar onHomeClick={handleHomeClick} onThemesClick={() => {}} showThemes={false} />
        </div>
    );
}

export default Tasbeeh;