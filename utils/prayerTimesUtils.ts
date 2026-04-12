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
    // For bundled assets starting with '/', return as is so the WebView loads them from its local server
    return s;
};

// Global audio instance for previewing tones
let previewAudio: HTMLAudioElement | null = null;

export const playNotificationSound = (source: string) => {
    if (!source || source === 'none') return;
    const mediaUrl = getMediaURL(source);
    
    // Stop any currently playing preview
    stopNotificationSound();

    try {
        previewAudio = new Audio(mediaUrl);
        previewAudio.play().catch(e => console.error("Audio play failed:", e));
    } catch (e) {
        console.error("Failed to play notification sound with HTML5 Audio:", e);
    }
};

export const stopNotificationSound = () => {
    if (previewAudio) {
        previewAudio.pause();
        previewAudio.currentTime = 0;
        previewAudio = null;
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
