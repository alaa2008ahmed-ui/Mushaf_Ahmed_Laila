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
    // Stop any streaming HTML5 Audio
    if (activeAudio) {
        try {
            activeAudio.pause();
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
 * Plays a given text, enforcing a male voice.
 * Supports both Native Android/iOS (via Capacitor) and Web Speech API.
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
        // Al-Afasy Morning Adhkar Complete Track
        streamUrl = 'https://server8.mp3quran.net/afs/adhkar/01.mp3';
    } else if (resolvedOptions.isEvening || resolvedOptions.categoryId === 'hisn_28') {
        // Al-Afasy Evening Adhkar Complete Track
        streamUrl = 'https://server8.mp3quran.net/afs/adhkar/02.mp3';
    } else if (resolvedOptions.isSalah || resolvedOptions.categoryId === 'hisn_25') {
        // Al-Afasy Remembrances after Prayer (chapter 25 in Hisn Al-Muslim maps to track 026.mp3)
        streamUrl = 'https://archive.org/download/hesn_el_moslem_mp3/026.mp3';
    } else if (resolvedOptions.categoryId && resolvedOptions.categoryId.startsWith('hisn_')) {
        const numPart = parseInt(resolvedOptions.categoryId.replace('hisn_', ''), 10);
        if (!isNaN(numPart) && numPart >= 1 && numPart <= 132) {
            // Track 001 is Introduction. Track 002 is hisn_1. Track 133 is hisn_132.
            const paddedNum = String(numPart + 1).padStart(3, '0');
            streamUrl = `https://archive.org/download/hesn_el_moslem_mp3/${paddedNum}.mp3`;
        }
    } else if (resolvedOptions.hadithId) {
        // Forty Nawawi Hadiths (01.mp3 to 42.mp3)
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
                // Fallback to local TTS
                playLocalTTS(text, onToast);
            };

            await audio.play();
            return;
        } catch (err) {
            console.warn('Failed to play streaming audio, falling back to TTS:', err);
            activeAudio = null;
            // Fallback to local TTS
            playLocalTTS(text, onToast);
            return;
        }
    }

    // Fallback: Local offline TTS with deep pitch-shifted male voice
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
                pitch: 0.75, // Deepen pitch natively: transforms generic system voice to deep, majestic male voice!
                volume: 1.0,
                category: 'playback'
            });

            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        } catch (err) {
            console.error('Native TTS Speak Error:', err);
            if (onToast) {
                onToast('خدمة القراءة الصوتية غير مفعلة أو تواجه مشكلة');
            }
            if (currentPlayingText === text) {
                currentPlayingText = null;
                notifyListeners();
            }
        }
        return;
    }

    // 2. WEB BROWSER SOLUTION (Previews, Safari, Chrome)
    if (!('speechSynthesis' in window)) {
        if (onToast) {
            onToast('خدمة القراءة الصوتية غير مدعومة على هذا الجهاز أو المتصفح');
        }
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88;

    // Get all available system/browser voices
    const voices = window.speechSynthesis.getVoices();
    const arabicVoices = voices.filter((v) => {
        const lang = v.lang.toLowerCase();
        return lang.startsWith('ar') || lang.includes('ar-');
    });

    // Keywords to recognize explicitly male Arabic voices
    const maleVoiceKeywords = [
        'maged', 'hazem', 'hamid', 'shakir', 'male', 'naayf', 'tarik', 'ward',
        'arb-local', 'ard-local', 'arz-local', 'b-local', 'c-local', 'd-local', 'wavenet-b', 'wavenet-c', 'standard-b', 'standard-c'
    ];

    // Keywords to explicitly avoid (female voices)
    const femaleVoiceKeywords = [
        'laila', 'hoda', 'female', 'yasmine', 'mary', 'zeina', 'salma',
        'ara-local', 'arc-local', 'are-local', 'a-local', 'e-local', 'wavenet-a', 'wavenet-d', 'standard-a', 'standard-d'
    ];

    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isExplicitMale = false;

    if (arabicVoices.length > 0) {
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
    }

    if (chosenVoice) {
        utterance.voice = chosenVoice;
        const name = chosenVoice.name.toLowerCase();
        isExplicitMale = maleVoiceKeywords.some((keyword) => name.includes(keyword));
    }

    // Drop the pitch to 0.78 for web fallback to turn female default voices into a gorgeous deep male voice.
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
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    window.speechSynthesis.speak(utterance);
};
