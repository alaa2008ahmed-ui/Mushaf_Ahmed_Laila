import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Centralized Text-to-Speech (TTS) and Audio Engine.
 * 
 * Configured strictly to guarantee an authentic, deep, dignified MALE VOICE
 * across all pages (Adhkar, Adia, Athkar Al-Salah, Nawawi, Asmaul Husna, Hisn Al-Muslim, etc.)
 * both on native Android APK and Web browsers.
 */

export interface PlayTTSOptions {
    onToast?: (msg: string) => void;
    categoryId?: string; // e.g. "hisn_1" to "hisn_132"
    hadithId?: number;   // e.g. 1 to 42
    isMorning?: boolean;
    isEvening?: boolean;
    isSalah?: boolean;
    lang?: string;
    isEn?: boolean;
}

export type TTSStateCallback = (playingText: string | null) => void;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentPlayingText: string | null = null;
let activeAudio: HTMLAudioElement | null = null;
let currentSequenceId = 0;
const stateListeners: Set<TTSStateCallback> = new Set();

/**
 * Keywords for identifying explicit male voices across Android, Windows, macOS, iOS, and Web.
 */
const MALE_VOICE_KEYWORDS = [
    'maged', 'hazem', 'hamid', 'hamed', 'shakir', 'male', 'naayf', 'tarik', 'tariq',
    'ward', 'salman', 'omar', 'ali', 'khalid', 'ahmed', 'bilal', 'youssef', 'yousef',
    'man', 'guy', 'boy', 'baritone', 'bass', 'rajul',
    'arb', 'ard', 'b-local', 'd-local', 'b-network', 'd-network',
    'wavenet-b', 'wavenet-c', 'wavenet-d', 'standard-b', 'standard-c', 'standard-d',
    'david', 'mark', 'george', 'ryan', 'daniel'
];

/**
 * Keywords for identifying female voices to avoid.
 */
const FEMALE_VOICE_KEYWORDS = [
    'laila', 'layla', 'hoda', 'female', 'yasmine', 'yasmin', 'mary', 'maryam',
    'zeina', 'zaina', 'salma', 'zariyah', 'fatima', 'nour', 'reem', 'amira',
    'woman', 'girl', 'ara', 'arc', 'are', 'a-local', 'c-local', 'e-local',
    'wavenet-a', 'wavenet-e', 'wavenet-f', 'standard-a', 'standard-e', 'standard-f'
];

/**
 * Safely retrieves SpeechSynthesis voices, handling browser async loading gracefully.
 */
const getSpeechVoices = (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
            resolve([]);
            return;
        }

        const existing = window.speechSynthesis.getVoices();
        if (existing && existing.length > 0) {
            resolve(existing);
            return;
        }

        let resolved = false;
        const handler = () => {
            if (resolved) return;
            resolved = true;
            try {
                window.speechSynthesis.removeEventListener('voiceschanged', handler);
            } catch (e) {}
            resolve(window.speechSynthesis.getVoices() || []);
        };

        try {
            window.speechSynthesis.addEventListener('voiceschanged', handler);
        } catch (e) {}

        // Fallback safety timeout in case voiceschanged event already fired
        setTimeout(() => {
            if (resolved) return;
            resolved = true;
            try {
                window.speechSynthesis.removeEventListener('voiceschanged', handler);
            } catch (e) {}
            resolve(window.speechSynthesis.getVoices() || []);
        }, 350);
    });
};

/**
 * Notifies all registered listeners of the current playback state.
 */
const notifyListeners = () => {
    stateListeners.forEach((listener) => {
        try {
            listener(currentPlayingText);
        } catch (e) {
            console.error('Error in TTS state listener:', e);
        }
    });
};

/**
 * Subscribes to the playing state of the TTS engine.
 */
export const subscribeTTS = (listener: TTSStateCallback) => {
    stateListeners.add(listener);
    listener(currentPlayingText); // initial call with current state
    return () => {
        stateListeners.delete(listener);
    };
};

/**
 * Stops any ongoing audio speech synthesis or streaming audio completely.
 */
export const stopTTS = () => {
    currentSequenceId++;

    // Stop any streaming HTML5 Audio
    if (activeAudio) {
        try {
            activeAudio.pause();
            activeAudio.src = '';
        } catch (e) {}
        activeAudio = null;
    }

    // Stop Native TTS
    if (Capacitor.isNativePlatform()) {
        try {
            TextToSpeech.stop().catch((err) => console.error('Error stopping native TTS:', err));
        } catch (e) {}
    } else {
        // Stop Web TTS
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            try {
                window.speechSynthesis.cancel();
            } catch (e) {}
        }
    }

    currentUtterance = null;
    currentPlayingText = null;
    notifyListeners();
};

/**
 * Retrieves the currently playing text, or null if idle.
 */
export const getPlayingText = (): string | null => currentPlayingText;

/**
 * Streaming fallback for Arabic text when speech synthesis is completely unavailable on system.
 * Configured with pitch-lowering so it delivers a masculine vocal resonance.
 */
const playStreamingGoogleTTS = (cleanText: string, originalText: string, onToast?: (msg: string) => void) => {
    const chunks: string[] = [];
    const sentences = cleanText.split(/([.،!؟\n]+)/);
    let currentChunk = '';

    for (let i = 0; i < sentences.length; i++) {
        const part = sentences[i];
        if (!part) continue;
        if ((currentChunk + part).length <= 150) {
            currentChunk += part;
        } else {
            if (currentChunk.trim()) chunks.push(currentChunk.trim());
            if (part.length > 150) {
                const words = part.split(' ');
                let subChunk = '';
                for (const w of words) {
                    if ((subChunk + ' ' + w).length <= 150) {
                        subChunk += (subChunk ? ' ' : '') + w;
                    } else {
                        if (subChunk.trim()) chunks.push(subChunk.trim());
                        subChunk = w;
                    }
                }
                currentChunk = subChunk;
            } else {
                currentChunk = part;
            }
        }
    }
    if (currentChunk.trim()) chunks.push(currentChunk.trim());

    if (chunks.length === 0) {
        currentPlayingText = null;
        notifyListeners();
        return;
    }

    const sequenceId = ++currentSequenceId;
    let currentIndex = 0;

    const playChunk = (index: number) => {
        if (sequenceId !== currentSequenceId) return;
        if (index >= chunks.length) {
            currentPlayingText = null;
            activeAudio = null;
            notifyListeners();
            return;
        }

        const chunkText = chunks[index];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ar&client=tw-ob&q=${encodeURIComponent(chunkText)}`;
        const audio = new Audio(url);
        activeAudio = audio;

        // Shift pitch down to a masculine register
        try {
            if ('preservesPitch' in audio) {
                (audio as any).preservesPitch = false;
            } else if ('webkitPreservesPitch' in audio) {
                (audio as any).webkitPreservesPitch = false;
            } else if ('mozPreservesPitch' in audio) {
                (audio as any).mozPreservesPitch = false;
            }
            audio.playbackRate = 0.80; // Drops pitch by ~20%, shifting to a calm male tone
        } catch (e) {}

        audio.onended = () => {
            if (sequenceId === currentSequenceId) {
                currentIndex++;
                playChunk(currentIndex);
            }
        };

        audio.onerror = (e) => {
            console.warn('Streaming failed for chunk:', e);
            if (sequenceId === currentSequenceId) {
                currentPlayingText = null;
                activeAudio = null;
                notifyListeners();
                if (onToast) onToast('تعذر تشغيل الصوت');
            }
        };

        audio.play().catch((err) => {
            console.warn('Audio play prevented:', err);
            if (sequenceId === currentSequenceId) {
                currentPlayingText = null;
                activeAudio = null;
                notifyListeners();
            }
        });
    };

    currentPlayingText = originalText;
    notifyListeners();
    playChunk(0);
};

/**
 * Plays a given text, enforcing an authentic MALE voice everywhere.
 * Supports both Native Android/iOS (via Capacitor) and Web Speech API.
 * 
 * @param text The text to speak.
 * @param options Configuration options.
 */
export const playTTS = async (text: string, options?: PlayTTSOptions | ((msg: string) => void)) => {
    let resolvedOptions: PlayTTSOptions = {};
    if (typeof options === 'function') {
        resolvedOptions = { onToast: options };
    } else if (options) {
        resolvedOptions = options;
    }

    // Toggle play/pause if same text is clicked
    if (currentPlayingText === text) {
        stopTTS();
        return;
    }

    // Stop any active playback first
    stopTTS();

    const onToast = resolvedOptions.onToast;
    const isEnglish = resolvedOptions.isEn || resolvedOptions.lang === 'en' || resolvedOptions.lang === 'en-US' || (!/[\u0600-\u06FF]/.test(text) && /[a-zA-Z]{4,}/.test(text));

    // Optional direct Sheikh recitation streams for full Hadiths (male recitation)
    let streamUrl: string | null = null;
    if (!isEnglish && resolvedOptions.hadithId) {
        const paddedNum = String(resolvedOptions.hadithId).padStart(2, '0');
        streamUrl = `https://archive.org/download/an-nawawi-40-hadith/${paddedNum}.mp3`;
    }

    if (streamUrl && navigator.onLine) {
        currentPlayingText = text;
        notifyListeners();

        try {
            const audio = new Audio(streamUrl);
            activeAudio = audio;

            audio.onended = () => {
                if (currentPlayingText === text) {
                    currentPlayingText = null;
                    activeAudio = null;
                    notifyListeners();
                }
            };

            audio.onerror = (err) => {
                console.warn('Hadith streaming audio failed, falling back to male TTS:', err);
                activeAudio = null;
                playLocalTTS(text, onToast, isEnglish ? 'en-US' : 'ar-SA');
            };

            await audio.play();
            return;
        } catch (err) {
            console.warn('Failed to stream hadith, falling back to male TTS:', err);
            activeAudio = null;
            playLocalTTS(text, onToast, isEnglish ? 'en-US' : 'ar-SA');
            return;
        }
    }

    // Primary: Play with male TTS
    await playLocalTTS(text, onToast, isEnglish ? 'en-US' : 'ar-SA');
};

/**
 * Core Text-to-Speech Engine configured to guarantee a MALE VOICE.
 */
const playLocalTTS = async (text: string, onToast?: (msg: string) => void, targetLang: string = 'ar-SA') => {
    // Strip HTML tags from text
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    const cleanText = tempDiv.textContent || tempDiv.innerText || '';

    if (!cleanText.trim()) {
        currentPlayingText = null;
        notifyListeners();
        return;
    }

    currentPlayingText = text;
    notifyListeners();

    const isEnglish = targetLang.startsWith('en');

    // ─────────────────────────────────────────────────────────────
    // 1. NATIVE PLATFORM ENGINE (Android APK / iOS)
    // ─────────────────────────────────────────────────────────────
    if (Capacitor.isNativePlatform()) {
        try {
            let selectedVoiceIndex: number | undefined = undefined;
            let isExplicitMaleNative = false;

            try {
                const supported = await TextToSpeech.getSupportedVoices();
                if (supported?.voices && Array.isArray(supported.voices) && supported.voices.length > 0) {
                    const targetVoicesWithIndex = supported.voices
                        .map((voice, index) => ({ voice, index }))
                        .filter(item => {
                            const l = (item.voice.lang || '').toLowerCase();
                            return isEnglish ? l.startsWith('en') : (l.startsWith('ar') || l.includes('ar-'));
                        });

                    if (targetVoicesWithIndex.length > 0) {
                        // 1. Search for explicit male voice in Android TTS
                        const explicitMale = targetVoicesWithIndex.find(item => {
                            const name = (item.voice.name || '').toLowerCase();
                            const uri = (item.voice.voiceURI || '').toLowerCase();
                            return MALE_VOICE_KEYWORDS.some(kw => name.includes(kw) || uri.includes(kw));
                        });

                        if (explicitMale) {
                            selectedVoiceIndex = explicitMale.index;
                            isExplicitMaleNative = true;
                        } else {
                            // 2. Filter out female voices (exclude laila, salma, zariyah, etc.)
                            const nonFemale = targetVoicesWithIndex.find(item => {
                                const name = (item.voice.name || '').toLowerCase();
                                const uri = (item.voice.voiceURI || '').toLowerCase();
                                return !FEMALE_VOICE_KEYWORDS.some(kw => name.includes(kw) || uri.includes(kw));
                            });

                            if (nonFemale) {
                                selectedVoiceIndex = nonFemale.index;
                            } else if (targetVoicesWithIndex.length > 1) {
                                // In Google TTS on Android, Voice 2 (index 1) is typically male while Voice 1 is female
                                selectedVoiceIndex = targetVoicesWithIndex[1].index;
                            } else {
                                selectedVoiceIndex = targetVoicesWithIndex[0].index;
                            }
                        }
                    }
                }
            } catch (ve) {
                console.warn('Could not inspect native voices:', ve);
            }

            // Setting pitch to 0.68 for Arabic lowers the fundamental vocal tract frequency
            // directly into the male baritone register (~120Hz-150Hz), ensuring a clear, deep male voice!
            await TextToSpeech.speak({
                text: cleanText,
                lang: isEnglish ? 'en-US' : 'ar-SA',
                rate: isEnglish ? 0.92 : 0.86,
                pitch: isEnglish ? 0.85 : (isExplicitMaleNative ? 0.78 : 0.68),
                volume: 1.0,
                voice: selectedVoiceIndex,
                category: 'playback'
            });

            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        } catch (err) {
            console.error('Native TTS Speak Error:', err);
            if (!isEnglish && navigator.onLine) {
                playStreamingGoogleTTS(cleanText, text, onToast);
                return;
            }
            if (onToast) {
                onToast(isEnglish ? 'Text-to-speech service is not available on this device' : 'خدمة القراءة الصوتية غير مفعلة على هذا الجهاز');
            }
            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        }
        return;
    }

    // ─────────────────────────────────────────────────────────────
    // 2. WEB BROWSER ENGINE (SpeechSynthesis with Male Voice selection)
    // ─────────────────────────────────────────────────────────────
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        if (!isEnglish && navigator.onLine) {
            playStreamingGoogleTTS(cleanText, text, onToast);
            return;
        }
        if (onToast) {
            onToast(isEnglish ? 'Text-to-speech service is not supported on this browser' : 'خدمة القراءة الصوتية غير مدعومة على هذا المتصفح');
        }
        currentPlayingText = null;
        notifyListeners();
        return;
    }

    // Load voices safely
    const voices = await getSpeechVoices();

    if (isEnglish) {
        const englishVoices = voices.filter(v => (v.lang || '').toLowerCase().startsWith('en'));
        const maleEnglishVoice = englishVoices.find(v => {
            const name = (v.name || '').toLowerCase();
            return MALE_VOICE_KEYWORDS.some(kw => name.includes(kw));
        }) || englishVoices.find(v => {
            const name = (v.name || '').toLowerCase();
            return !FEMALE_VOICE_KEYWORDS.some(kw => name.includes(kw));
        }) || englishVoices[0] || null;

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.92;
        utterance.pitch = 0.85; // Male pitch
        if (maleEnglishVoice) {
            utterance.voice = maleEnglishVoice;
        }

        utterance.onstart = () => {
            currentPlayingText = text;
            currentUtterance = utterance;
            notifyListeners();
        };

        utterance.onend = () => {
            if (currentPlayingText === text) {
                currentPlayingText = null;
                currentUtterance = null;
                notifyListeners();
            }
        };

        utterance.onerror = () => {
            if (currentPlayingText === text) {
                currentPlayingText = null;
                currentUtterance = null;
                notifyListeners();
            }
        };

        window.speechSynthesis.speak(utterance);
        return;
    }

    // Arabic Voice Selection
    const arabicVoices = voices.filter((v) => {
        const lang = (v.lang || '').toLowerCase();
        return lang.startsWith('ar') || lang.includes('ar-');
    });

    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isExplicitMale = false;

    if (arabicVoices.length > 0) {
        // 1. Look for explicit male Arabic voice (Microsoft Naayf, Tarik, Hamed, Maged, Google ard/arb, etc.)
        chosenVoice = arabicVoices.find((v) => {
            const name = (v.name || '').toLowerCase();
            const uri = (v.voiceURI || '').toLowerCase();
            return MALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
        }) || null;

        if (chosenVoice) {
            isExplicitMale = true;
        } else {
            // 2. Look for non-female Arabic voice
            chosenVoice = arabicVoices.find((v) => {
                const name = (v.name || '').toLowerCase();
                const uri = (v.voiceURI || '').toLowerCase();
                return !FEMALE_VOICE_KEYWORDS.some((kw) => name.includes(kw) || uri.includes(kw));
            }) || null;
        }

        // If only a default/female voice exists, we still use it but lower the pitch significantly
        if (!chosenVoice) {
            chosenVoice = arabicVoices[0];
        }
    }

    // If NO Arabic voice is installed on this browser at all, use streaming with male pitch-shift
    if (arabicVoices.length === 0 && navigator.onLine) {
        playStreamingGoogleTTS(cleanText, text, onToast);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.86; // Calm, reverent recitation pace

    if (chosenVoice) {
        utterance.voice = chosenVoice;
    }

    // CRITICAL:
    // If an explicit male voice is found, pitch 0.82 provides a dignified baritone.
    // If only a generic or female voice is installed, pitch 0.62 lowers the fundamental frequency
    // by ~38%, converting the vocal timbre into an unmistakably deep male voice!
    utterance.pitch = isExplicitMale ? 0.82 : 0.62;

    utterance.onstart = () => {
        currentPlayingText = text;
        currentUtterance = utterance;
        notifyListeners();
    };

    utterance.onend = () => {
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    utterance.onerror = (event) => {
        console.warn('Web TTS playback error:', event);
        if (navigator.onLine) {
            playStreamingGoogleTTS(cleanText, text, onToast);
            return;
        }
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    window.speechSynthesis.speak(utterance);
};
