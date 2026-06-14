import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { App as CapacitorApp } from '@capacitor/app';
import { parseVoiceCommand, normalizeArabic } from '../utils/voiceParser';
import { SURAH_NAMES_AR } from '../components/QuranReader/constants';

export interface VoiceCommand {
    id: string;
    phrase: string;
    action: string;
    isDefault?: boolean;
}

interface VoiceControlContextType {
    isEnabled: boolean;
    setIsEnabled: (enabled: boolean) => void;
    toggleEnabled: () => void;
    showVoiceIcon: boolean;
    setShowVoiceIcon: (show: boolean) => void;
    isListening: boolean;
    transcript: string;
    commands: VoiceCommand[];
    currentPage: string;
    setCurrentPage: (page: string) => void;
    updateCommand: (id: string, phrase: string) => void;
    addCommand: (phrase: string, action: string) => void;
    deleteCommand: (id: string) => void;
    resetToDefaults: () => void;
}

const DEFAULT_COMMANDS: VoiceCommand[] = [
    { id: 'go_home', phrase: 'الرئيسية', action: 'go_home', isDefault: true },
    { id: 'open_quran', phrase: 'مصحف', action: 'open_quran', isDefault: true },
    { id: 'nav_quran_page', phrase: 'صفحة القراءة', action: 'open_quran', isDefault: true },
    { id: 'nav_quran_full', phrase: 'القرآن الكريم', action: 'open_quran', isDefault: true },
    { id: 'open_prayer', phrase: 'فتح مواقيت الصلاة', action: 'open_prayer', isDefault: true },
    { id: 'nav_prayer', phrase: 'مواقيت الصلاه', action: 'open_prayer', isDefault: true },
    { id: 'open_qibla', phrase: 'فتح القبلة', action: 'open_qibla', isDefault: true },
    { id: 'nav_qibla', phrase: 'القبله', action: 'open_qibla', isDefault: true },
    { id: 'open_tasbeeh', phrase: 'فتح السبحه', action: 'open_tasbeeh', isDefault: true },
    { id: 'nav_tasbeeh', phrase: 'السبحه', action: 'open_tasbeeh', isDefault: true },
    { id: 'open_athkar', phrase: 'فتح الأذكار', action: 'open_athkar', isDefault: true },
    { id: 'nav_athkar', phrase: 'الاذكار', action: 'open_athkar', isDefault: true },
    { id: 'open_salah_adhkar', phrase: 'فتح أذكار الصلاة', action: 'open_salah_adhkar', isDefault: true },
    { id: 'nav_salah_adhkar', phrase: 'اذكار الصلاه', action: 'open_salah_adhkar', isDefault: true },
    { id: 'open_hisn_muslim', phrase: 'فتح حصن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'nav_hisn_muslim', phrase: 'حصن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'nav_hisn_muslim_alt', phrase: 'حسن المسلم', action: 'open_hisn_muslim', isDefault: true },
    { id: 'open_calendar', phrase: 'فتح التقويم', action: 'open_calendar', isDefault: true },
    { id: 'nav_calendar', phrase: 'التقويم', action: 'open_calendar', isDefault: true },
    { id: 'open_listen', phrase: 'فتح الاستماع للقرآن', action: 'open_listen', isDefault: true },
    { id: 'nav_listen', phrase: 'الاستماع للقران', action: 'open_listen', isDefault: true },
    { id: 'open_settings', phrase: 'فتح الإعدادات', action: 'open_settings', isDefault: true },
    { id: 'nav_settings', phrase: 'الاعدادات', action: 'open_settings', isDefault: true },
    { id: 'open_themes', phrase: 'فتح الثيمات', action: 'open_themes', isDefault: true },
    { id: 'nav_themes', phrase: 'ثيمات', action: 'open_themes', isDefault: true },
    { id: 'nav_themes_alt', phrase: 'السيمات', action: 'open_themes', isDefault: true },
    { id: 'nav_themes_alt2', phrase: 'سيمات', action: 'open_themes', isDefault: true },
    { id: 'nav_themes_alt3', phrase: 'الثيمات', action: 'open_themes', isDefault: true },
    { id: 'open_voice_control', phrase: 'فتح التحكم الصوتي', action: 'open_voice_control', isDefault: true },
    { id: 'nav_voice_control', phrase: 'التحكم الصوتى', action: 'open_voice_control', isDefault: true },
    { id: 'open_adia', phrase: 'فتح الادعيه', action: 'open_adia', isDefault: true },
    { id: 'nav_adia', phrase: 'الادعيه', action: 'open_adia', isDefault: true },
    { id: 'open_hajj_umrah', phrase: 'فتح الحج والعمرة', action: 'open_hajj_umrah', isDefault: true },
    { id: 'nav_hajj_umrah', phrase: 'الحج والعمرة', action: 'open_hajj_umrah', isDefault: true },
    { id: 'open_asmaul_husna', phrase: 'فتح أسماء الله الحسنى', action: 'open_asmaul_husna', isDefault: true },
    { id: 'nav_asmaul_husna', phrase: 'اسماء الله الحسنى', action: 'open_asmaul_husna', isDefault: true },
    { id: 'open_daily_wird', phrase: 'فتح الورد اليومي', action: 'open_daily_wird', isDefault: true },
    { id: 'nav_daily_wird', phrase: 'الورد اليومي', action: 'open_daily_wird', isDefault: true },
    { id: 'open_memorization', phrase: 'فتح التحفيظ', action: 'open_memorization', isDefault: true },
    { id: 'nav_memorization', phrase: 'التحفيظ', action: 'open_memorization', isDefault: true },
    { id: 'open_more', phrase: 'فتح قائمة التطبيقات', action: 'open_more', isDefault: true },
    { id: 'nav_more', phrase: 'قائمة التطبيقات', action: 'open_more', isDefault: true },
    { id: 'open_nawawi', phrase: 'فتح الاربعون النوويه', action: 'open_nawawi', isDefault: true },
    { id: 'nav_nawawi', phrase: 'الاربعون النوويه', action: 'open_nawawi', isDefault: true },
    { id: 'go_back', phrase: 'رجوع', action: 'go_back', isDefault: true },
    { id: 'exit_app', phrase: 'خروج', action: 'exit_app', isDefault: true },
    { id: 'increase_font', phrase: 'تكبير الخط', action: 'increase_font', isDefault: true },
    { id: 'increase_font_alt', phrase: 'تكبير', action: 'increase_font', isDefault: true },
    { id: 'decrease_font', phrase: 'تصغير الخط', action: 'decrease_font', isDefault: true },
    { id: 'decrease_font_alt', phrase: 'تصغير', action: 'decrease_font', isDefault: true },
    { id: 'change_theme', phrase: 'تغيير لون الخلفية', action: 'change_theme', isDefault: true },
    { id: 'change_theme_alt', phrase: 'لون الخلفيه', action: 'change_theme', isDefault: true },
    { id: 'play_audio', phrase: 'تشغيل الصوت', action: 'play_audio', isDefault: true },
    { id: 'play_audio_alt', phrase: 'تشغيل', action: 'play_audio', isDefault: true },
    { id: 'stop_audio', phrase: 'إيقاف الصوت', action: 'stop_audio', isDefault: true },
    { id: 'stop_audio_alt', phrase: 'إيقاف', action: 'stop_audio', isDefault: true },
    { id: 'show_tafsir', phrase: 'عرض التفسير', action: 'show_tafsir', isDefault: true },
    { id: 'open_bookmarks', phrase: 'فتح العلامات', action: 'open_bookmarks', isDefault: true },
    { id: 'toggle_auto_scroll', phrase: 'تشغيل التمرير التلقائى', action: 'toggle_auto_scroll', isDefault: true },
    { id: 'toggle_auto_scroll_alt', phrase: 'التمرير التلقائى', action: 'toggle_auto_scroll', isDefault: true },
    { id: 'faster_auto_scroll', phrase: 'اسرع', action: 'faster_auto_scroll', isDefault: true },
    { id: 'slower_auto_scroll', phrase: 'ابطئ', action: 'slower_auto_scroll', isDefault: true },
    { id: 'pause_auto_scroll', phrase: 'ايقاف التمرير', action: 'pause_auto_scroll', isDefault: true },
    { id: 'pause_auto_scroll_alt', phrase: 'ايقاف مؤقت', action: 'pause_auto_scroll', isDefault: true },
    { id: 'stop_auto_scroll', phrase: 'اغلاق التمرير', action: 'stop_auto_scroll', isDefault: true },
    { id: 'stop_auto_scroll_alt', phrase: 'ايقاف كامل', action: 'stop_auto_scroll', isDefault: true },
    { id: 'open_share', phrase: 'المشاركه', action: 'open_share', isDefault: true },
    { id: 'open_share_alt', phrase: 'مشاركه', action: 'open_share', isDefault: true },
    { id: 'open_search', phrase: 'فتح البحث', action: 'open_search', isDefault: true },
    { id: 'open_search_alt', phrase: 'بحث', action: 'open_search', isDefault: true },
    { id: 'close_modal', phrase: 'اغلاق القائمه', action: 'close_modal', isDefault: true },
    { id: 'close_modal_alt', phrase: 'اغلاق', action: 'close_modal', isDefault: true },
    { id: 'next_page', phrase: 'التالي', action: 'next_page', isDefault: true },
    { id: 'prev_page', phrase: 'السابق', action: 'prev_page', isDefault: true },
    { id: 'disable_voice_control', phrase: 'إيقاف التحكم الصوتي', action: 'disable_voice_control', isDefault: true },
];

const VoiceControlContext = createContext<VoiceControlContextType | undefined>(undefined);

export const VoiceControlProvider: React.FC<{ children: React.ReactNode, onAction: (action: string, text: string, params?: any) => void }> = ({ children, onAction }) => {
    const [isEnabled, setIsEnabled] = useState(false);
    const [showVoiceIcon, setShowVoiceIcon] = useState(() => localStorage.getItem('show_voice_icon') !== 'false');
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [currentPage, setCurrentPage] = useState('home');
    const [commands, setCommands] = useState<VoiceCommand[]>(() => {
        const saved = localStorage.getItem('voice_commands_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            // Merge any new default commands that might be missing
            const missingDefaults = DEFAULT_COMMANDS.filter(dc => !parsed.some((pc: VoiceCommand) => pc.id === dc.id));
            return [...parsed, ...missingDefaults];
        }
        return DEFAULT_COMMANDS;
    });

    const isEnabledRef = useRef(isEnabled);
    const isStartingRef = useRef(false);
    const webRecognitionRef = useRef<any>(null);

    useEffect(() => {
        localStorage.setItem('voice_commands_v2', JSON.stringify(commands));
    }, [commands]);

    const reloadCommands = useCallback(() => {
        const saved = localStorage.getItem('voice_commands_v2');
        if (saved) {
            const parsed = JSON.parse(saved);
            const missingDefaults = DEFAULT_COMMANDS.filter(dc => !parsed.some((pc: VoiceCommand) => pc.id === dc.id));
            setCommands([...parsed, ...missingDefaults]);
            console.log('Voice commands reloaded from storage');
        } else {
            setCommands(DEFAULT_COMMANDS);
        }
    }, []);

    const handleCommand = useCallback((text: string) => {
        const normalizedInput = normalizeArabic(text);
        console.log('Voice Control - Context:', currentPage);
        console.log('Voice Control - Original Input:', text);

        // 1. Contextual Focus: If an input is focused, type into it
        const activeElement = document.activeElement;
        const isSearchContext = currentPage === 'search' || (activeElement && activeElement.closest('.search-modal'));
        
        if (activeElement && (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)) {
            console.log('Voice Control - Typing into focused input');
            
            // Special case for Search: Clear search if user says 'إلغاء'
            if (isSearchContext && (normalizedInput === 'الغاء' || normalizedInput === 'إلغاء' || normalizedInput === 'امسح')) {
                console.log('Voice Control - Clearing search');
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'clear_search' } }));
                return;
            }

            const val = activeElement.value;
            // For search, we might want to replace the whole text if they say a new word, 
            // but appending is safer. Let's just append with a space if there's already text.
            const newText = val.length > 0 ? val + ' ' + text : text;
            activeElement.value = newText;
            activeElement.selectionStart = activeElement.selectionEnd = newText.length;
            
            // React needs a native input event to update state
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(activeElement, newText);
            activeElement.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Special case for Search: Execute search immediately
            if (isSearchContext) {
                console.log('Voice Control - Executing search');
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'execute_search', text: newText } }));
            }
            return;
        }

        // 2. Specific Page Context Handling
        if (currentPage === 'search' || isSearchContext) {
            if (normalizedInput === 'الغاء' || normalizedInput === 'إلغاء' || normalizedInput === 'امسح' || normalizedInput.includes('الغاء البحث') || normalizedInput.includes('بحث جديد')) {
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'clear_search' } }));
                return;
            }
            if (normalizedInput.includes('اغلاق البحث') || normalizedInput.includes('اغلاق')) {
                window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'close_search' } }));
                return;
            }
            
            // If search is open but input not focused, still search for the word
            console.log('Voice Control - Search Context: Searching for', text);
            window.dispatchEvent(new CustomEvent('voice-command', { detail: { action: 'execute_search', text: text } }));
            return;
        }

        // 3. Use the new parser for Quran navigation and dynamic commands
        const parsed = parseVoiceCommand(text, SURAH_NAMES_AR, commands);
        if (parsed) {
            console.log('Voice Control - Parsed Command:', parsed.action, parsed.params);
            
            if (parsed.action === 'disable_voice_control') {
                setIsEnabled(false);
                return;
            }

            if (parsed.action === 'ui_discovery') {
                // Try to find a matching UI element and click it (Voice-to-Click Engine)
                // Prioritize exact matches and specific containers based on context
                const selectors = currentPage === 'quran' 
                    ? '.quran-reader-container button, .quran-reader-container [role="button"], .quran-reader-container li'
                    : 'button, [role="button"], a, .clickable, .voice-target, li, span, h1, h2, h3, p';
                
                const elements = document.querySelectorAll(selectors);
                for (const el of Array.from(elements)) {
                    const htmlEl = el as HTMLElement;
                    const elText = normalizeArabic(htmlEl.innerText || htmlEl.getAttribute('aria-label') || htmlEl.title || '');
                    if (elText && (elText === normalizedInput || elText.includes(normalizedInput))) {
                        console.log('Voice Control - UI Discovery: Clicking', elText);
                        htmlEl.click();
                        return;
                    }
                }
            }
            
            onAction(parsed.action, text, parsed.params);
            return;
        }

        // 4. Fallback to basic pattern matching for Quran navigation (if parser missed it)
        if (normalizedInput.includes('سوره') || normalizedInput.includes('سورة') || 
            normalizedInput.includes('صفحه') || normalizedInput.includes('صفحة') || 
            normalizedInput.includes('جزء')) {
            console.log('Voice Control - Fallback Match: Quran Navigation');
            onAction('quran_navigation', text);
        }
    }, [commands, onAction, currentPage]);

    const handleCommandRef = useRef(handleCommand);

    useEffect(() => {
        handleCommandRef.current = handleCommand;
    }, [handleCommand]);

    const startRecognition = useCallback(async () => {
        if (isStartingRef.current) return;
        isStartingRef.current = true;

        // Reload commands every time we start recognition as requested
        reloadCommands();

        const startWebRecognition = () => {
            const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognitionAPI) {
                console.error("Speech Recognition API not supported in this browser.");
                setIsEnabled(false);
                setIsListening(false);
                isStartingRef.current = false;
                return;
            }

            if (!webRecognitionRef.current) {
                const recognition = new SpeechRecognitionAPI();
                // Set continuous to true to prevent constant restarting and beeping
                recognition.continuous = true; 
                recognition.lang = 'ar-SA';
                recognition.interimResults = true;
                
                recognition.onstart = () => {
                    setIsListening(true);
                };
                
                recognition.onresult = (event: any) => {
                    const lastResult = event.results[event.results.length - 1];
                    const finalTranscript = lastResult[0].transcript.trim().toLowerCase();
                    setTranscript(finalTranscript);
                    if (lastResult.isFinal) {
                        handleCommandRef.current(finalTranscript);
                    }
                };
                
                recognition.onerror = (event: any) => {
                    console.error('Web Speech API Error:', event.error);
                    if (event.error === 'not-allowed') {
                        setIsEnabled(false);
                        setIsListening(false);
                    }
                    // If error is no-speech, we can just let it continue or restart silently
                };
                
                recognition.onend = () => {
                    if (isEnabledRef.current) {
                        // Only restart if it's still supposed to be enabled
                        try {
                            webRecognitionRef.current?.start();
                        } catch (e) {
                            // Ignore
                        }
                    } else {
                        setIsListening(false);
                    }
                };
                
                webRecognitionRef.current = recognition;
            }
            
            try {
                webRecognitionRef.current.start();
            } catch (e) {
                // Already started
            }
            isStartingRef.current = false;
        };

        try {
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            
            console.log('Voice Recognition Started. Active phrases:', commands.map(c => c.phrase));
            
            // 1. Safely check and request permissions without blocking
            try {
                const checkPerm = await SpeechRecognition.checkPermissions();
                if (checkPerm.speechRecognition !== 'granted') {
                    await SpeechRecognition.requestPermissions();
                }
            } catch (permError) {
                console.warn('Permission check error (proceeding anyway):', permError);
            }

            // 2. Start listening loop
            const listenLoop = async () => {
                if (!isEnabledRef.current) {
                    setIsListening(false);
                    return;
                }
                
                try {
                    setIsListening(true);
                    const result = await SpeechRecognition.start({
                        language: "ar-SA",
                        maxResults: 1,
                        partialResults: false, // Changed to false for stability on mobile
                        popup: false 
                    });

                    if (result && result.matches && result.matches.length > 0) {
                        const finalTranscript = result.matches[0].trim().toLowerCase();
                        setTranscript(finalTranscript);
                        handleCommandRef.current(finalTranscript);
                    }
                } catch (e: any) {
                    if (e?.message === 'Method not implemented on web.' || e?.message?.includes('not implemented')) {
                        startWebRecognition();
                        return; // Stop loop on web
                    }
                    console.error('Speech recognition error:', e);
                } finally {
                    if (isEnabledRef.current && !webRecognitionRef.current) {
                        // Minimal delay to allow system to breathe but keep loop tight
                        setTimeout(listenLoop, 500);
                    } else if (!isEnabledRef.current) {
                        setIsListening(false);
                    }
                }
            };

            listenLoop();
            isStartingRef.current = false;

        } catch (e: any) {
            // Ignore "Method not implemented on web" error as it's expected in browser
            if (e?.message === 'Method not implemented on web.' || e?.message?.includes('not implemented')) {
                startWebRecognition();
            } else {
                console.error('Error starting recognition:', e);
                setIsEnabled(false);
                isStartingRef.current = false;
            }
        }
    }, [reloadCommands, commands]);

    const stopRecognition = useCallback(async () => {
        try {
            if (webRecognitionRef.current) {
                webRecognitionRef.current.stop();
            }
            const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
            await SpeechRecognition.stop();
        } catch (e: any) {
            // Ignore "Method not implemented on web" error as it's expected in browser
            if (e?.message !== 'Method not implemented on web.' && !e?.message?.includes('not implemented')) {
                console.error('Error stopping recognition:', e);
            }
        }
        setIsListening(false);
    }, []);

    // Sync state changes to refs and trigger start/stop
    useEffect(() => {
        isEnabledRef.current = isEnabled;
        
        if (isEnabled) {
            startRecognition();
        } else {
            stopRecognition();
        }
    }, [isEnabled, startRecognition, stopRecognition]);

    // Disable voice control when app goes to background
    useEffect(() => {
        const listener = CapacitorApp.addListener('appStateChange', ({ isActive }) => {
            if (!isActive && isEnabledRef.current) {
                setIsEnabled(false);
            }
        });

        return () => {
            listener.then(l => l.remove());
        };
    }, []);

    // Handle pause/resume from audio playback
    const wasEnabledBeforePauseRef = useRef(false);
    
    useEffect(() => {
        const handlePause = () => {
            if (isEnabledRef.current) {
                console.log('Voice Control - Pausing for audio playback');
                wasEnabledBeforePauseRef.current = true;
                setIsEnabled(false);
            }
        };

        const handleResume = () => {
            if (wasEnabledBeforePauseRef.current) {
                console.log('Voice Control - Resuming after audio playback');
                wasEnabledBeforePauseRef.current = false;
                setIsEnabled(true);
            }
        };

        window.addEventListener('voice-control-pause', handlePause);
        window.addEventListener('voice-control-resume', handleResume);

        return () => {
            window.removeEventListener('voice-control-pause', handlePause);
            window.removeEventListener('voice-control-resume', handleResume);
        };
    }, [startRecognition, stopRecognition]);

    const toggleEnabled = useCallback(() => {
        setIsEnabled(prev => !prev);
    }, []);

    const updateCommand = (id: string, phrase: string) => {
        setCommands(prev => prev.map(c => c.id === id ? { ...c, phrase } : c));
    };

    const addCommand = (phrase: string, action: string) => {
        const newCmd: VoiceCommand = {
            id: Date.now().toString(),
            phrase,
            action,
            isDefault: false
        };
        setCommands(prev => [...prev, newCmd]);
    };

    const deleteCommand = (id: string) => {
        setCommands(prev => prev.filter(c => c.id !== id));
    };

    const resetToDefaults = () => {
        setCommands(DEFAULT_COMMANDS);
    };

    const handleSetShowVoiceIcon = (show: boolean) => {
        setShowVoiceIcon(show);
        localStorage.setItem('show_voice_icon', String(show));
    };

    return (
        <VoiceControlContext.Provider value={{
            isEnabled,
            setIsEnabled,
            toggleEnabled,
            showVoiceIcon,
            setShowVoiceIcon: handleSetShowVoiceIcon,
            isListening,
            transcript,
            commands,
            currentPage,
            setCurrentPage,
            updateCommand,
            addCommand,
            deleteCommand,
            resetToDefaults
        }}>
            {children}
        </VoiceControlContext.Provider>
    );
};

export const useVoiceControl = () => {
    const context = useContext(VoiceControlContext);
    if (context === undefined) {
        throw new Error('useVoiceControl must be used within a VoiceControlProvider');
    }
    return context;
};
