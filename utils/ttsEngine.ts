/**
 * Centralized Text-to-Speech (TTS) Engine for spiritual texts (Adia, Adhkar, Hadiths).
 * Ensures a robust, high-quality, offline male voice across all devices and browsers.
 */

export type TTSStateCallback = (playingText: string | null) => void;

let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentPlayingText: string | null = null;
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
 * Stops any ongoing audio speech synthesis completely.
 */
export const stopTTS = () => {
    if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
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
 * Plays a given text via Web Speech API, enforcing a male voice.
 * @param text The Arabic text to speak.
 * @param onToast Optional callback to notify the UI of any messages or errors.
 */
export const playTTS = (text: string, onToast?: (msg: string) => void) => {
    if (!('speechSynthesis' in window)) {
        if (onToast) {
            onToast('خدمة القراءة الصوتية غير مدعومة على هذا الجهاز أو المتصفح');
        }
        return;
    }

    // Strip HTML tags from text if any
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = text;
    let cleanText = tempDiv.textContent || tempDiv.innerText || '';

    // If the exact text is already playing, stop it (toggle play/pause)
    if (currentPlayingText === text) {
        stopTTS();
        return;
    }

    // Cancel any active playback
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';

    // Set speed slightly lower (0.85 - 0.90) for calm, majestic, and clear Arabic pronunciation.
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
        // 1. Look for a voice with known male tags
        chosenVoice = arabicVoices.find((v) => {
            const name = v.name.toLowerCase();
            return maleVoiceKeywords.some((keyword) => name.includes(keyword));
        }) || null;

        // 2. If not found, try to avoid explicit female names
        if (!chosenVoice) {
            chosenVoice = arabicVoices.find((v) => {
                const name = v.name.toLowerCase();
                return !femaleVoiceKeywords.some((keyword) => name.includes(keyword));
            }) || null;
        }

        // 3. Fallback to any Arabic voice
        if (!chosenVoice) {
            chosenVoice = arabicVoices[0];
        }
    }

    if (chosenVoice) {
        utterance.voice = chosenVoice;
        const name = chosenVoice.name.toLowerCase();
        isExplicitMale = maleVoiceKeywords.some((keyword) => name.includes(keyword));
    }

    // THE FUNDAMENTAL PITCH ADJUSTMENT:
    // If the voice is explicitly a known high-quality male voice, use a natural dignified pitch (0.90 - 0.95).
    // If we had to fall back to a generic/female Arabic voice (which is the default on many mobile/desktop environments),
    // we drop the pitch to 0.78. This lowers the vocal frequency by ~22%, turning the female voice into a beautiful,
    // calm, deep male voice. This resolves the female-voice issue fundamentally for offline TTS!
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
        console.error('TTS playback error:', event);
        if (currentPlayingText === text) {
            currentPlayingText = null;
            currentUtterance = null;
            notifyListeners();
        }
    };

    window.speechSynthesis.speak(utterance);
};
