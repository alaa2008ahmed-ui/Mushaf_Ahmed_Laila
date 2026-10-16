import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Centralized Text-to-Speech (TTS) and Audio Streaming Engine for spiritual texts.
 * 
 * Functions:
 * 1. Online Mode: If connected to the internet, streams high-quality recordings by Sheikh Mishary Al-Afasy
 *    from secure public CDNs / Archive.org, matched by Hadith ID or Hisn Al-Muslim chapter IDs.
 * 2. Offline Fallback Mode: If offline or stream fails, uses the native device TextToSpeech (APK)
 *    or HTML5 SpeechSynthesis (Web), optimized with pitch/rate adjustments to guarantee a deep, male voice.
 */

export interface PlayTTSOptions {
    onToast?: (msg: string) => void;
    categoryId?: string; // e.g. "hisn_1" to "hisn_132"
    hadithId?: number;   // e.g. 1 to 42
    isMorning?: boolean;
    isEvening?: boolean;
    isSalah?: boolean;
}

export type TTSStateCallback = (playingText: string | null) => void;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentPlayingText: string | null = null;
let activeAudio: HTMLAudioElement | null = null;
let currentSequenceId = 0;
const stateListeners: Set<TTSStateCallback> = new Set();

/**
 * Notifies all registered listeners of the current playback state.
 */
const notifyListeners = () => {
    stateListeners.forEach((listener) => listener(currentPlayingText));
};

/**
 * Subscribes to the playing state of the TTS engine.
 * Useful for React components to synchronize their play/pause buttons.
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
        TextToSpeech.stop().catch((err) => console.error('Error stopping native TTS:', err));
    } else {
        // Stop Web TTS
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
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
 * Streams pure, authentic Arabic audio via Google Translate TTS chunks.
 * Guarantees that Arabic text is always read correctly with proper pronunciation,
 * preventing browser default English voices from skipping Arabic words and only reading numbers.
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

        audio.onended = () => {
            if (sequenceId === currentSequenceId) {
                currentIndex++;
                playChunk(currentIndex);
            }
        };

        audio.onerror = (e) => {
            console.warn('Google TTS streaming failed for chunk:', e);
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
 * Plays a given text, enforcing an Arabic voice.
 * Supports both Native Android/iOS (via Capacitor) and Web Speech API, with streaming fallback.
 * @param text The Arabic text to speak.
 * @param options Configuration options including category/hadith mapping for Sheikh Al-Afasy streaming.
 */
export const playTTS = async (text: string, options?: PlayTTSOptions | ((msg: string) => void)) => {
    // Handle legacy signature if passed directly as a toast callback
    let resolvedOptions: PlayTTSOptions = {};
    if (typeof options === 'function') {
        resolvedOptions = { onToast: options };
    } else if (options) {
        resolvedOptions = options;
    }

    // If the exact text is already playing, stop it (toggle play/pause)
    if (currentPlayingText === text) {
        stopTTS();
        return;
    }

    // Stop any active playback first
    stopTTS();

    const onToast = resolvedOptions.onToast;

    // Determine if we can stream the actual Sheikh Al-Afasy recording from public CDNs
    let streamUrl: string | null = null;

    if (resolvedOptions.isMorning || resolvedOptions.categoryId === 'hisn_27') {
        streamUrl = 'https://server8.mp3quran.net/afs/adhkar/01.mp3';
    } else if (resolvedOptions.isEvening || resolvedOptions.categoryId === 'hisn_28') {
        streamUrl = 'https://server8.mp3quran.net/afs/adhkar/02.mp3';
    } else if (resolvedOptions.isSalah || resolvedOptions.categoryId === 'hisn_25') {
        streamUrl = 'https://archive.org/download/hesn_el_moslem_mp3/026.mp3';
    } else if (resolvedOptions.categoryId && resolvedOptions.categoryId.startsWith('hisn_')) {
        const numPart = parseInt(resolvedOptions.categoryId.replace('hisn_', ''), 10);
        if (!isNaN(numPart) && numPart >= 1 && numPart <= 132) {
            const paddedNum = String(numPart + 1).padStart(3, '0');
            streamUrl = `https://archive.org/download/hesn_el_moslem_mp3/${paddedNum}.mp3`;
        }
    } else if (resolvedOptions.hadithId) {
        const paddedNum = String(resolvedOptions.hadithId).padStart(2, '0');
        streamUrl = `https://archive.org/download/an-nawawi-40-hadith/${paddedNum}.mp3`;
    }

    // If online and we mapped a direct Al-Afasy recording, stream it directly!
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
                console.warn('Streaming audio failed, falling back to TTS:', err);
                activeAudio = null;
                playLocalTTS(text, onToast);
            };

            await audio.play();
            return;
        } catch (err) {
            console.warn('Failed to play streaming audio, falling back to TTS:', err);
            activeAudio = null;
            playLocalTTS(text, onToast);
            return;
        }
    }

    // Fallback: Local TTS with authentic Arabic voice or online streaming
    await playLocalTTS(text, onToast);
};

/**
 * Fallback local Text-to-Speech engine.
 */
const playLocalTTS = async (text: string, onToast?: (msg: string) => void) => {
    // Strip HTML tags from text if any
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';

    currentPlayingText = text;
    notifyListeners();

    // 1. NATIVE PLATFORM SOLUTION (Android APK / iOS)
    if (Capacitor.isNativePlatform()) {
        try {
            await TextToSpeech.speak({
                text: cleanText,
                lang: 'ar-SA',
                rate: 0.88,
                pitch: 0.75,
                volume: 1.0,
                category: 'playback'
            });

            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        } catch (err) {
            console.error('Native TTS Speak Error:', err);
            if (navigator.onLine) {
                playStreamingGoogleTTS(cleanText, text, onToast);
                return;
            }
            if (onToast) {
                onToast('خدمة القراءة الصوتية غير مفعلة على هذا الجهاز');
            }
            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        }
        return;
    }

    // 2. WEB BROWSER SOLUTION (Previews, Safari, Chrome)
    let arabicVoiceAvailable = false;
    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isExplicitMale = false;

    const maleVoiceKeywords = [
        'maged', 'hazem', 'hamid', 'shakir', 'male', 'naayf', 'tarik', 'ward',
        'arb-local', 'ard-local', 'arz-local', 'b-local', 'c-local', 'd-local', 'wavenet-b', 'wavenet-c', 'standard-b', 'standard-c'
    ];

    const femaleVoiceKeywords = [
        'laila', 'hoda', 'female', 'yasmine', 'mary', 'zeina', 'salma',
        'ara-local', 'arc-local', 'are-local', 'a-local', 'e-local', 'wavenet-a', 'wavenet-d', 'standard-a', 'standard-d'
    ];

    if ('speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const arabicVoices = voices.filter((v) => {
            const lang = v.lang.toLowerCase();
            return lang.startsWith('ar') || lang.includes('ar-');
        });

        if (arabicVoices.length > 0) {
            arabicVoiceAvailable = true;
            chosenVoice = arabicVoices.find((v) => {
                const name = v.name.toLowerCase();
                return maleVoiceKeywords.some((keyword) => name.includes(keyword));
            }) || null;

            if (!chosenVoice) {
                chosenVoice = arabicVoices.find((v) => {
                    const name = v.name.toLowerCase();
                    return !femaleVoiceKeywords.some((keyword) => name.includes(keyword));
                }) || null;
            }

            if (!chosenVoice) {
                chosenVoice = arabicVoices[0];
            }

            if (chosenVoice) {
                const name = chosenVoice.name.toLowerCase();
                isExplicitMale = maleVoiceKeywords.some((keyword) => name.includes(keyword));
            }
        }
    }

    // If online and NO Arabic voice is installed on the browser/system,
    // stream pure, fluent Arabic audio using Google TTS!
    // This prevents English fallback voices from skipping Arabic text and only reading numbers.
    if (!arabicVoiceAvailable && navigator.onLine) {
        playStreamingGoogleTTS(cleanText, text, onToast);
        return;
    }

    if (!('speechSynthesis' in window)) {
        if (navigator.onLine) {
            playStreamingGoogleTTS(cleanText, text, onToast);
            return;
        }
        if (onToast) {
            onToast('خدمة القراءة الصوتية غير مدعومة على هذا الجهاز أو المتصفح');
        }
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88;

    if (chosenVoice) {
        utterance.voice = chosenVoice;
    }

    utterance.pitch = isExplicitMale ? 0.95 : 0.78;

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
        console.error('Web TTS playback error:', event);
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
