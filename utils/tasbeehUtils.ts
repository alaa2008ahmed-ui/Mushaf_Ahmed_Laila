export const toArabicNumerals = (num: number | string | null | undefined) => {
    if (num === null || num === undefined) return '';
    return String(num).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[+d]);
};

export const toEnglishNumerals = (str: string | null | undefined) => {
    if (str === null || str === undefined) return '';
    const map: Record<string, string> = { '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4', '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9' };
    return str.toString().replace(/[٠-٩]/g, m => map[m]);
};

export const playSound = (freq = 880, dur = 0.05) => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + dur);
    } catch (e) { console.warn("Could not play sound", e); }
};

export const vibrate = (pattern: number | number[] = 50) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
};
