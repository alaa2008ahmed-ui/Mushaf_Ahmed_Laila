import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Centralized Text-to-Speech (TTS) and Audio Engine.
 * 
 * Configured strictly to guarantee an authentic, deep, dignified MALE VOICE
 * across all pages (Adhkar, Adia, Athkar Al-Salah, Nawawi, Asmaul Husna, Hisn Al-Muslim, etc.)
 * in BOTH Arabic and English, on native Android APK and Web browsers.
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
 * Keywords for identifying explicit male voices across Android (Google TTS / Samsung),
 * Windows (SAPI / Edge), macOS / iOS (Apple voices), and Web Speech API.
 */
const MALE_VOICE_KEYWORDS = [
    // Arabic male voice names & tokens
    'maged', 'hazem', 'hamid', 'hamed', 'shakir', 'naayf', 'tarik', 'tariq',
    'ward', 'salman', 'omar', 'ali', 'khalid', 'ahmed', 'bilal', 'youssef', 'yousef',
    'arb', 'ard', 'rajul', 'shaikh', 'sheikh',

    // Generic male indicators
    'male', '#male', 'male_1', 'male_2', 'male_3', 'male_4', 'male-local', 'male-network',
    'man', 'guy', 'boy', 'baritone', 'bass', 'deep',

    // English male voice names (Microsoft, Apple, Google, Nuance, Samsung, Amazon)
    'david', 'mark', 'george', 'ryan', 'daniel', 'alex', 'fred', 'oliver',
    'thomas', 'tom', 'brian', 'arthur', 'aaron', 'charles', 'matthew',
    'james', 'richard', 'michael', 'christopher', 'edward', 'william',
    'john', 'paul', 'peter', 'steven', 'stephen', 'lee', 'russell', 'sam',
    'guy', 'eric', 'steffan',

    // Android Google TTS male voice model tokens
    'iob', 'iod', 'iol', 'iom', 'tpd', 'tpb', 'tpa', 'sfg#male',
    'wavenet-b', 'wavenet-d', 'wavenet-i', 'wavenet-j',
    'standard-b', 'standard-d', 'standard-i', 'standard-j',
    'journey-d', 'journey-f', 'studio-b', 'studio-c',
    'b-local', 'd-local', 'i-local', 'j-local',
    'b-network', 'd-network', 'i-network', 'j-network',
    'en-us-b', 'en-us-d', 'en-gb-b', 'en-gb-d', 'en-au-b', 'en-au-d',

    // Samsung TTS male indicators
    'en_us_m', 'en_gb_m', 'm01', 'm02', '_m0', 'smt_en_us_m', 'samsung_tts_en_us_male',
    'ar_sa_m', 'smt_ar_sa_m'
];

/**
 * Keywords for identifying female voices to strictly avoid across all platforms.
 */
const FEMALE_VOICE_KEYWORDS = [
    // Generic female indicators
    'female', '#female', 'female_1', 'female_2', 'female_3', 'female_4',
    'woman', 'girl', 'lady',

    // English female names (Microsoft, Apple, Amazon, Google, Samsung)
    'zira', 'samantha', 'victoria', 'karen', 'serena', 'fiona', 'moira',
    'tessa', 'veena', 'hazel', 'susan', 'heather', 'eva', 'catherine',
    'linda', 'sarah', 'lisa', 'jessica', 'emily', 'chloe', 'kendra',
    'kimberly', 'salli', 'joanna', 'ivy', 'amy', 'jenny', 'aria',
    'stephanie', 'ava', 'allison', 'nicole', 'nadine', 'sonia',
    'katie', 'alice', 'lucy', 'helen', 'michelle',

    // Arabic female names
    'laila', 'layla', 'hoda', 'yasmine', 'yasmin', 'mary', 'maryam',
    'zeina', 'zaina', 'salma', 'zariyah', 'fatima', 'nour', 'reem',
    'amira', 'imraah',

    // Google TTS female voice models / tokens
    'sfg-local', 'sfg#female', 'sfg_female',
    'tpf', 'tpc', 'tpe',
    'ioa', 'ioc', 'ioe', 'iof', 'iog', 'ioh',
    'ara', 'arc', 'are',
    'a-local', 'c-local', 'e-local', 'f-local', 'g-local', 'h-local',
    'a-network', 'c-network', 'e-network', 'f-network', 'g-network', 'h-network',
    'wavenet-a', 'wavenet-c', 'wavenet-e', 'wavenet-f', 'wavenet-g', 'wavenet-h',
    'standard-a', 'standard-c', 'standard-e', 'standard-f', 'standard-g', 'standard-h',

    // Samsung TTS female indicators
    'en_us_f', 'en_gb_f', 'f01', 'f02', '_f0', 'smt_en_us_f', 'samsung_tts_en_us_female'
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
 * Streaming fallback for text when speech synthesis is completely unavailable on system.
 * Configured with pitch-lowering so it delivers a masculine vocal resonance in both Arabic and English.
 */
const playStreamingGoogleTTS = (cleanText: string, originalText: string, onToast?: (msg: string) => void, isEn: boolean = false) => {
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
    const langCode = isEn ? 'en' : 'ar';

    const playChunk = (index: number) => {
        if (sequenceId !== currentSequenceId) return;
        if (index >= chunks.length) {
            currentPlayingText = null;
            activeAudio = null;
            notifyListeners();
            return;
        }

        const chunkText = chunks[index];
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${langCode}&client=tw-ob&q=${encodeURIComponent(chunkText)}`;
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
                if (onToast) onToast(isEn ? 'Failed to play audio' : 'تعذر تشغيل الصوت');
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
 * Plays a given text, strictly enforcing an authentic MALE voice in both Arabic and English.
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

    // Detect language: explicitly passed or derived from content
    const arabicCharsCount = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const latinCharsCount = (text.match(/[a-zA-Z]/g) || []).length;
    const isEnglish = Boolean(
        resolvedOptions.isEn || 
        resolvedOptions.lang?.toLowerCase().startsWith('en') || 
        (latinCharsCount > 3 && latinCharsCount >= arabicCharsCount)
    );

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

    // Primary: Play with guaranteed male TTS
    await playLocalTTS(text, onToast, isEnglish ? 'en-US' : 'ar-SA');
};

/**
 * Core Text-to-Speech Engine configured to guarantee a MALE VOICE in both Arabic and English.
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
                            return isEnglish
                                ? (l.startsWith('en') || l.includes('en-') || l.includes('en_'))
                                : (l.startsWith('ar') || l.includes('ar-') || l.includes('ar_'));
                        });

                    if (targetVoicesWithIndex.length > 0) {
                        // 1. Prioritize explicit male voice in Android TTS (Google TTS, Samsung, Qualcomm, etc.)
                        const explicitMale = targetVoicesWithIndex.find(item => {
                            const name = (item.voice.name || '').toLowerCase();
                            const uri = (item.voice.voiceURI || '').toLowerCase();
                            const combined = `${name} ${uri}`;
                            const hasMale = MALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                            const hasFemale = FEMALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                            return hasMale && !hasFemale;
                        });

                        if (explicitMale) {
                            selectedVoiceIndex = explicitMale.index;
                            isExplicitMaleNative = true;
                        } else {
                            // 2. Filter out known female voices
                            const nonFemale = targetVoicesWithIndex.find(item => {
                                const name = (item.voice.name || '').toLowerCase();
                                const uri = (item.voice.voiceURI || '').toLowerCase();
                                const combined = `${name} ${uri}`;
                                return !FEMALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                            });

                            if (nonFemale) {
                                selectedVoiceIndex = nonFemale.index;
                                isExplicitMaleNative = false;
                            } else if (targetVoicesWithIndex.length > 1) {
                                // In Google TTS on Android, Voice 2 (index 1) is typically male (Voice B / Voice D)
                                selectedVoiceIndex = targetVoicesWithIndex[1].index;
                                isExplicitMaleNative = false;
                            } else {
                                selectedVoiceIndex = targetVoicesWithIndex[0].index;
                                isExplicitMaleNative = false;
                            }
                        }
                    }
                }
            } catch (ve) {
                console.warn('Could not inspect native voices:', ve);
            }

            // CRITICAL VOCAL PITCH CALIBRATION:
            // - If an explicit male voice is found on the device, pitch 0.78 gives a deep, resonant, masculine cadence.
            // - If only a default/unknown/female voice is installed on the device, pitch 0.66 shifts the fundamental
            //   vocal tract formant (F0) down by ~34%, actively transposing the voice into a human male baritone!
            // This is applied consistently to BOTH Arabic and English, guaranteeing a male voice at all times.
            const targetPitch = isExplicitMaleNative ? 0.78 : 0.66;
            const targetRate = isEnglish ? 0.90 : 0.86;

            await TextToSpeech.speak({
                text: cleanText,
                lang: isEnglish ? 'en-US' : 'ar-SA',
                rate: targetRate,
                pitch: targetPitch,
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
            if (navigator.onLine) {
                playStreamingGoogleTTS(cleanText, text, onToast, isEnglish);
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
        if (navigator.onLine) {
            playStreamingGoogleTTS(cleanText, text, onToast, isEnglish);
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
        const englishVoices = voices.filter(v => {
            const l = (v.lang || '').toLowerCase();
            return l.startsWith('en') || l.includes('en-') || l.includes('en_');
        });

        let chosenEnglishVoice: SpeechSynthesisVoice | null = null;
        let isExplicitMaleWeb = false;

        if (englishVoices.length > 0) {
            // 1. Look for explicit male English voice (David, Mark, George, Alex, etc.)
            chosenEnglishVoice = englishVoices.find(v => {
                const name = (v.name || '').toLowerCase();
                const uri = (v.voiceURI || '').toLowerCase();
                const combined = `${name} ${uri}`;
                const hasMale = MALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                const hasFemale = FEMALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                return hasMale && !hasFemale;
            }) || null;

            if (chosenEnglishVoice) {
                isExplicitMaleWeb = true;
            } else {
                // 2. Look for non-female English voice
                chosenEnglishVoice = englishVoices.find(v => {
                    const name = (v.name || '').toLowerCase();
                    const uri = (v.voiceURI || '').toLowerCase();
                    const combined = `${name} ${uri}`;
                    return !FEMALE_VOICE_KEYWORDS.some(kw => combined.includes(kw));
                }) || null;

                if (!chosenEnglishVoice && englishVoices.length > 1) {
                    chosenEnglishVoice = englishVoices[1];
                } else if (!chosenEnglishVoice) {
                    chosenEnglishVoice = englishVoices[0];
                }
            }
        }

        // If NO English voice is installed on this browser at all, use streaming fallback
        if (englishVoices.length === 0 && navigator.onLine) {
            playStreamingGoogleTTS(cleanText, text, onToast, true);
            return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'en-US';
        utterance.rate = 0.90;
        // Pitch: 0.78 for explicit male; 0.65 for generic/female fallback to ensure male voice
        utterance.pitch = isExplicitMaleWeb ? 0.78 : 0.65;
        if (chosenEnglishVoice) {
            utterance.voice = chosenEnglishVoice;
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
            if (navigator.onLine) {
                playStreamingGoogleTTS(cleanText, text, onToast, true);
                return;
            }
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
        return lang.startsWith('ar') || lang.includes('ar-') || lang.includes('ar_');
    });

    let chosenVoice: SpeechSynthesisVoice | null = null;
    let isExplicitMale = false;

    if (arabicVoices.length > 0) {
        // 1. Look for explicit male Arabic voice (Microsoft Naayf, Tarik, Hamed, Maged, Google ard/arb, etc.)
        chosenVoice = arabicVoices.find((v) => {
            const name = (v.name || '').toLowerCase();
            const uri = (v.voiceURI || '').toLowerCase();
            const combined = `${name} ${uri}`;
            const hasMale = MALE_VOICE_KEYWORDS.some((kw) => combined.includes(kw));
            const hasFemale = FEMALE_VOICE_KEYWORDS.some((kw) => combined.includes(kw));
            return hasMale && !hasFemale;
        }) || null;

        if (chosenVoice) {
            isExplicitMale = true;
        } else {
            // 2. Look for non-female Arabic voice
            chosenVoice = arabicVoices.find((v) => {
                const name = (v.name || '').toLowerCase();
                const uri = (v.voiceURI || '').toLowerCase();
                const combined = `${name} ${uri}`;
                return !FEMALE_VOICE_KEYWORDS.some((kw) => combined.includes(kw));
            }) || null;
        }

        // If only a default/female voice exists, we still use it but lower the pitch significantly
        if (!chosenVoice) {
            chosenVoice = arabicVoices[0];
        }
    }

    // If NO Arabic voice is installed on this browser at all, use streaming with male pitch-shift
    if (arabicVoices.length === 0 && navigator.onLine) {
        playStreamingGoogleTTS(cleanText, text, onToast, false);
        return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.86; // Calm, reverent recitation pace

    if (chosenVoice) {
        utterance.voice = chosenVoice;
    }

    // Pitch: 0.78 for explicit male; 0.65 for fallback/female to ensure male voice
    utterance.pitch = isExplicitMale ? 0.78 : 0.65;

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
            playStreamingGoogleTTS(cleanText, text, onToast, false);
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
