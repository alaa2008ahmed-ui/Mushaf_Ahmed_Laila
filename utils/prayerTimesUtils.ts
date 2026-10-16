import { Capacitor } from '@capacitor/core';

export const checkSupportsDST = (combinedCode: string, fullCountry: string) => {
    if (!combinedCode && !fullCountry) return false;
    const dstCodes = ['+20', '+961', '+970', '+1', '+44', '+33', '+49', '+39', '+34', '+61', '+64'];
    const dstCountries = ['مصر', 'لبنان', 'فلسطين', 'أمريكا', 'كندا', 'بريطانيا', 'فرنسا', 'ألمانيا', 'إيطاليا', 'إسبانيا', 'أستراليا'];
    return dstCodes.some(c => combinedCode.startsWith(c)) || dstCountries.some(c => fullCountry.includes(c));
};

export const applyOffset = (timeStr: string, offsetMins: number) => {
    if (!timeStr || timeStr.includes('--')) return "--:--";
    let [h, m] = timeStr.split(':');
    let date = new Date();
    date.setHours(parseInt(h), parseInt(m), 0);
    date.setMinutes(date.getMinutes() + (offsetMins || 0));
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

export const formatTime12 = (time: string) => {
    if(!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    let hInt = parseInt(h);
    const ap = hInt >= 12 ? 'pm' : 'am';
    hInt = hInt % 12 || 12;
    return `<span class="text-xl font-black">${hInt}:${m.toString().padStart(2, '0')}</span> <span class="time-period">${ap}</span>`;
};

export const formatTime12_EN = (time: string) => {
    if (!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    let hInt = parseInt(h);
    const ap = hInt >= 12 ? 'pm' : 'am';
    hInt = hInt % 12 || 12;
    return `${hInt}:${m.toString().padStart(2, '0')} ${ap}`;
}

export const formatTime12_clean = (time: string) => {
    if (!time || time.includes('--')) return "--:-- --";
    let [h, m] = time.split(':');
    let hInt = parseInt(h);
    const ap = hInt >= 12 ? 'pm' : 'am';
    hInt = hInt % 12 || 12;
    return `${hInt}:${m.toString().padStart(2, '0')} ${ap}`;
}

export const getMediaURL = (s: string) => {
    if (!s) return '';
    if (s.startsWith('file://')) {
        return Capacitor.convertFileSrc(s);
    }
    if (s.startsWith('data:') || s.startsWith('blob:') || s.startsWith('http://') || s.startsWith('https://')) {
        return s;
    }
    // Handle standalone filenames like "salah.mp3" or "salah"
    let cleanPath = s;
    if (!cleanPath.includes('/')) {
        const withExt = cleanPath.endsWith('.mp3') ? cleanPath : `${cleanPath}.mp3`;
        cleanPath = `/assets/audio/${withExt}`;
    } else if (!cleanPath.startsWith('/')) {
        cleanPath = `/${cleanPath}`;
    }
    // For bundled assets starting with '/', resolve with window.location.origin if available
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
        return `${window.location.origin}${cleanPath}`;
    }
    return cleanPath;
};

// Global audio instance for playing and previewing tones
let previewAudio: HTMLAudioElement | null = null;
let currentAudioSource: string | null = null;
let lastPlayTimestamp = 0;
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext || audioContext.state === 'closed') {
        audioContext = new AudioCtx();
    }
    if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
    }
    return audioContext;
};

// Auto unlock audio on any user interaction
if (typeof window !== 'undefined') {
    const unlock = () => {
        try {
            const ctx = getAudioContext();
            if (ctx && ctx.state === 'suspended') {
                ctx.resume();
            }
        } catch (e) {}
    };
    window.addEventListener('click', unlock, { once: true, passive: true });
    window.addEventListener('touchstart', unlock, { once: true, passive: true });
    window.addEventListener('keydown', unlock, { once: true, passive: true });
}

export const playSyntheticChime = () => {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        
        // Gentle melodic two-tone chime bell (D5 -> A5)
        const notes = [
            { freq: 587.33, start: now, duration: 1.0 },
            { freq: 880.00, start: now + 0.35, duration: 1.4 }
        ];

        notes.forEach(({ freq, start, duration }) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);
            
            gain.gain.setValueAtTime(0, start);
            gain.gain.linearRampToValueAtTime(0.35, start + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(start);
            osc.stop(start + duration);
        });
    } catch (e) {
        console.warn('Synthetic chime failed:', e);
    }
};

export const playNotificationSound = (source: string, force: boolean = false) => {
    if (!source || source === 'none') return;

    const now = Date.now();
    if (!force) {
        // Prevent duplicate playback: If ANY sound was triggered less than 1500ms ago, ignore
        if (now - lastPlayTimestamp < 1500) {
            console.log(`[playNotificationSound] Ignored rapid duplicate playback (${now - lastPlayTimestamp}ms ago): ${source}`);
            return;
        }
        // If the exact same sound was triggered less than 4000ms ago, ignore
        if (currentAudioSource === source && (now - lastPlayTimestamp) < 4000) {
            console.log(`[playNotificationSound] Ignored duplicate playback request for: ${source}`);
            return;
        }
    }

    const mediaUrl = getMediaURL(source);
    
    // Stop and fully unload any currently playing audio cleanly before starting new one
    stopNotificationSound();

    lastPlayTimestamp = now;
    currentAudioSource = source;

    try {
        const audio = new Audio(mediaUrl);
        audio.volume = 1.0;
        previewAudio = audio;

        audio.onended = () => {
            if (previewAudio === audio) {
                previewAudio = null;
                currentAudioSource = null;
            }
        };

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(e => {
                // If the audio was interrupted or stopped deliberately via pause(), do NOT execute fallback
                if (e && (e.name === 'AbortError' || e.message?.includes('interrupted') || e.message?.includes('pause'))) {
                    return;
                }

                console.warn("Audio play failed on resolved mediaUrl:", e);

                // Clean up the initial audio element before attempting fallback so two streams never play
                try {
                    audio.pause();
                    audio.currentTime = 0;
                    audio.src = '';
                    audio.removeAttribute('src');
                    audio.load();
                } catch (ignored) {}

                // Attempt alternative path
                const altSource = source.startsWith('/') ? source.slice(1) : `/${source}`;
                try {
                    const fallbackAudio = new Audio(altSource);
                    fallbackAudio.volume = 1.0;
                    previewAudio = fallbackAudio;

                    fallbackAudio.onended = () => {
                        if (previewAudio === fallbackAudio) {
                            previewAudio = null;
                            currentAudioSource = null;
                        }
                    };

                    fallbackAudio.play().catch(err => {
                        if (err && (err.name === 'AbortError' || err.message?.includes('interrupted'))) {
                            return;
                        }
                        console.warn("Audio play fallback failed, using synthetic chime:", err);
                        if (source.includes('chime')) {
                            playSyntheticChime();
                        }
                    });
                } catch (err2) {
                    if (source.includes('chime')) {
                        playSyntheticChime();
                    }
                }
            });
        }
    } catch (e) {
        console.error("Failed to play notification sound with HTML5 Audio:", e);
        if (source.includes('chime')) {
            playSyntheticChime();
        }
    }
};

export const stopNotificationSound = () => {
    if (previewAudio) {
        try {
            previewAudio.pause();
            previewAudio.currentTime = 0;
            previewAudio.src = '';
            previewAudio.removeAttribute('src');
            previewAudio.load();
        } catch (e) {}
        previewAudio = null;
        currentAudioSource = null;
    }
};

export const calculateNightTimes = (maghribTimeStr: string, fajrTimeStr: string) => {
    if (!maghribTimeStr || !fajrTimeStr || maghribTimeStr.includes('--') || fajrTimeStr.includes('--')) {
        return { midnight: "--:--", lastThird: "--:--", firstThird: "--:--" };
    }
    
    const [mH, mM] = maghribTimeStr.split(':').map(Number);
    const [fH, fM] = fajrTimeStr.split(':').map(Number);
    
    let maghribDate = new Date();
    maghribDate.setHours(mH, mM, 0, 0);
    
    let fajrDate = new Date();
    fajrDate.setHours(fH, fM, 0, 0);
    
    if (fajrDate <= maghribDate) {
        fajrDate.setDate(fajrDate.getDate() + 1);
    }
    
    const diffMs = fajrDate.getTime() - maghribDate.getTime();
    
    const firstThirdDate = new Date(maghribDate.getTime() + diffMs / 3);
    const midnightDate = new Date(maghribDate.getTime() + diffMs / 2);
    const lastThirdDate = new Date(maghribDate.getTime() + (diffMs * 2) / 3);
    
    const formatTime = (d: Date) => {
        return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    };
    
    return {
        firstThird: formatTime(firstThirdDate),
        midnight: formatTime(midnightDate),
        lastThird: formatTime(lastThirdDate)
    };
};
