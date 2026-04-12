import React, { useState, useRef, useEffect, useCallback } from 'react';
import { READERS, TAFSEERS, JUZ_MAP } from './constants';
import { normalizeArabic } from '../../utils/voiceParser';

interface DownloadModalProps {
    onClose: () => void;
    quranData: any;
    showToast: (msg: string) => void;
    isLandscape?: boolean;
    mode?: 'ayah' | 'surah';
    readersList?: { id: string, name: string }[];
}

// --- Helper Functions ---

const getAyahsForJuz = (juzNumber: number, quranData: any) => {
    const ayahsToDownload: {surah: number, ayah: number}[] = [];
    const startJuz = JUZ_MAP[juzNumber - 1];
    const endJuz = juzNumber < 30 ? JUZ_MAP[juzNumber] : null;

    let currentSurah = startJuz.s;
    let currentAyah = startJuz.a;

    while (true) {
        if (endJuz && currentSurah === endJuz.s && currentAyah === endJuz.a) {
            break;
        }
        
        ayahsToDownload.push({surah: currentSurah, ayah: currentAyah});
        
        const surahData = quranData.surahs.find((s: any) => s.number === currentSurah);
        if (!surahData) break;
        
        if (currentAyah < surahData.ayahs.length) {
            currentAyah++;
        } else {
            currentSurah++;
            currentAyah = 1;
            if (currentSurah > 114) break;
        }
    }
    return ayahsToDownload;
};

const getSanitizedReaderId = (readerId: string) => {
    if (readerId.startsWith('http')) {
        return readerId.replace(/https?:\/\//, '').replace(/\//g, '_').replace(/\./g, '_');
    }
    return readerId;
};

const checkSurahDownloaded = async (readerId: string, surahNumber: number, quranData: any, mode: 'ayah' | 'surah' = 'ayah') => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        if (downloadedFiles.length === 0) return false;
        
        const sanitizedId = getSanitizedReaderId(readerId);
        const surahStr = String(surahNumber).padStart(3, '0');

        if (mode === 'surah') {
            const fileName = `${sanitizedId}_${surahStr}.mp3`;
            return downloadedFiles.some((file: any) => file.fileName === fileName);
        } else {
            const surah = quranData.surahs.find((s: any) => s.number === surahNumber);
            if (!surah) return false;
            
            for (let i = 1; i <= surah.ayahs.length; i++) {
                const fileName = `${sanitizedId}_${surahNumber}_${i}.mp3`;
                const exists = downloadedFiles.some((file: any) => file.fileName === fileName);
                if (!exists) return false;
            }
            return true;
        }
    } catch (e) {
        console.error('Error checking surah download:', e);
        return false;
    }
};

const checkAllQuranDownloaded = async (readerId: string, quranData: any) => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        if (downloadedFiles.length === 0) return false;
        
        const sanitizedId = getSanitizedReaderId(readerId);
        for (const surah of quranData.surahs) {
            for (let i = 1; i <= surah.ayahs.length; i++) {
                const fileName = `${sanitizedId}_${surah.number}_${i}.mp3`;
                const exists = downloadedFiles.some((file: any) => file.fileName === fileName);
                if (!exists) return false;
            }
        }
        return true;
    } catch (e) {
        console.error('Error checking all quran download:', e);
        return false;
    }
};

const storeAudioOffline = (fileName: string, blob: Blob) => {
    try {
        const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
        const fileRecord = {
            fileName: fileName,
            timestamp: Date.now(),
            size: blob.size
        };
        
        const existingIndex = downloadedFiles.findIndex((file: any) => file.fileName === fileName);
        if(existingIndex !== -1) {
            downloadedFiles[existingIndex] = fileRecord;
        } else {
            downloadedFiles.push(fileRecord);
        }
        
        localStorage.setItem('downloaded_audio_files', JSON.stringify(downloadedFiles));
    } catch (e) {
        console.error('Error storing audio offline record:', e);
    }
};

const checkTafsirDownloaded = async (tafsirId: string, surahNumber: number) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        if (downloadedTafsir.length === 0) return false;
        
        const fileName = `${tafsirId}_${surahNumber}_tafsir.json`;
        return downloadedTafsir.some((file: any) => file.fileName === fileName);
    } catch (e) {
        console.error('Error checking tafsir download:', e);
        return false;
    }
};

const checkAllTafsirDownloaded = async (tafsirId: string, quranData: any) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        if (downloadedTafsir.length === 0) return false;
        
        for (const surah of quranData.surahs) {
            const fileName = `${tafsirId}_${surah.number}_tafsir.json`;
            const exists = downloadedTafsir.some((file: any) => file.fileName === fileName);
            if (!exists) return false;
        }
        return true;
    } catch (e) {
        console.error('Error checking all tafsir download:', e);
        return false;
    }
};

const storeTafsirOffline = (fileName: string, data: any) => {
    try {
        const downloadedTafsir = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
        const fileRecord = {
            fileName: fileName,
            data: data, // Storing full data in localStorage might hit limits, but per requirements
            timestamp: Date.now()
        };
        
        const existingIndex = downloadedTafsir.findIndex((file: any) => file.fileName === fileName);
        if(existingIndex !== -1) {
            downloadedTafsir[existingIndex] = fileRecord;
        } else {
            downloadedTafsir.push(fileRecord);
        }
        
        localStorage.setItem('downloaded_tafsir_files', JSON.stringify(downloadedTafsir));
        // Also store the actual content in a separate key to avoid massive single JSON
        localStorage.setItem(`tafsir_content_${fileName}`, JSON.stringify(data));
    } catch (e) {
        console.error('Error storing tafsir offline:', e);
    }
};

export const QuranDownloadModal: React.FC<DownloadModalProps> = ({ onClose, quranData, showToast, isLandscape, mode = 'ayah', readersList = READERS }) => {
    const [selectedReader, setSelectedReader] = useState('');
    const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
    const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
    const [downloadedSurahs, setDownloadedSurahs] = useState<string[]>([]);
    const [downloadedJuzs, setDownloadedJuzs] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const checkDownloads = useCallback(async () => {
        if (!selectedReader || !quranData) {
            setDownloadedSurahs([]);
            setDownloadedJuzs([]);
            return;
        }
        try {
            const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
            const downloadedSet = new Set(downloadedFiles.filter((f: any) => (f.size || 0) > 1000).map((f: any) => f.fileName));
            const sanitizedId = getSanitizedReaderId(selectedReader);

            const dSurahs: string[] = [];
            for (const surah of quranData.surahs) {
                let allItemsDownloaded = true;
                const surahStr = String(surah.number).padStart(3, '0');
                if (mode === 'surah') {
                    const fileName = `${sanitizedId}_${surahStr}.mp3`;
                    if (!downloadedSet.has(fileName)) {
                        allItemsDownloaded = false;
                    }
                } else {
                    for (let i = 1; i <= surah.ayahs.length; i++) {
                        if (!downloadedSet.has(`${sanitizedId}_${surah.number}_${i}.mp3`)) {
                            allItemsDownloaded = false;
                            break;
                        }
                    }
                }
                if (allItemsDownloaded) dSurahs.push(surah.number.toString());
            }

            const dJuzs: string[] = [];
            for (let j = 1; j <= 30; j++) {
                const ayahs = getAyahsForJuz(j, quranData);
                let allItemsDownloaded = true;
                
                if (mode === 'surah') {
                    const surahsInJuz = Array.from(new Set(ayahs.map(a => a.surah)));
                    for (const sNum of surahsInJuz) {
                        const surahStr = String(sNum).padStart(3, '0');
                        const fileName = `${sanitizedId}_${surahStr}.mp3`;
                        if (!downloadedSet.has(fileName)) {
                            allItemsDownloaded = false;
                            break;
                        }
                    }
                } else {
                    for (const a of ayahs) {
                        if (!downloadedSet.has(`${sanitizedId}_${a.surah}_${a.ayah}.mp3`)) {
                            allItemsDownloaded = false;
                            break;
                        }
                    }
                }
                if (allItemsDownloaded) dJuzs.push(j.toString());
            }

            setDownloadedSurahs(dSurahs);
            setDownloadedJuzs(dJuzs);
        } catch (e) {
            console.error('Error checking downloads:', e);
        }
    }, [selectedReader, quranData, mode]);

    useEffect(() => {
        checkDownloads();
    }, [checkDownloads]);

    const toggleSurah = (surahNum: string) => {
        if (surahNum === 'all') {
            if (selectedSurahs.includes('all')) {
                setSelectedSurahs([]);
            } else {
                setSelectedSurahs(['all']);
                setSelectedJuzs([]);
            }
            return;
        }
        
        let newSelection = [...selectedSurahs];
        if (newSelection.includes('all')) newSelection = newSelection.filter(s => s !== 'all');
        
        if (newSelection.includes(surahNum)) {
            newSelection = newSelection.filter(s => s !== surahNum);
        } else {
            newSelection.push(surahNum);
        }
        setSelectedSurahs(newSelection);
    };

    const toggleJuz = (juzNum: string) => {
        let newSelection = [...selectedJuzs];
        if (selectedSurahs.includes('all')) setSelectedSurahs(selectedSurahs.filter(s => s !== 'all'));
        
        if (newSelection.includes(juzNum)) {
            newSelection = newSelection.filter(j => j !== juzNum);
        } else {
            newSelection.push(juzNum);
        }
        setSelectedJuzs(newSelection);
    };

    const downloadSelected = async () => {
        if (!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) return;
        
        setIsDownloading(true);
        setStatus('جاري التحضير للتحميل...');
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            const itemsToDownload = new Set<string>();
            
            if (selectedSurahs.includes('all')) {
                for (const surah of quranData.surahs) {
                    if (mode === 'surah') {
                        itemsToDownload.add(`${surah.number}`);
                    } else {
                        for (let i = 1; i <= surah.ayahs.length; i++) {
                            itemsToDownload.add(`${surah.number}_${i}`);
                        }
                    }
                }
            } else {
                for (const surahNumStr of selectedSurahs) {
                    const surahNum = parseInt(surahNumStr);
                    const surah = quranData.surahs.find((s: any) => s.number === surahNum);
                    if (surah) {
                        if (mode === 'surah') {
                            itemsToDownload.add(`${surahNum}`);
                        } else {
                            for (let i = 1; i <= surah.ayahs.length; i++) {
                                itemsToDownload.add(`${surahNum}_${i}`);
                            }
                        }
                    }
                }
                
                for (const juzNumStr of selectedJuzs) {
                    const juzNum = parseInt(juzNumStr);
                    const ayahs = getAyahsForJuz(juzNum, quranData);
                    if (mode === 'surah') {
                        const surahsInJuz = Array.from(new Set(ayahs.map(a => a.surah)));
                        for (const sNum of surahsInJuz) {
                            itemsToDownload.add(`${sNum}`);
                        }
                    } else {
                        for (const a of ayahs) {
                            itemsToDownload.add(`${a.surah}_${a.ayah}`);
                        }
                    }
                }
            }
            
            const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
            const downloadedSet = new Set(downloadedFiles.map((f: any) => f.fileName));
            const sanitizedId = getSanitizedReaderId(selectedReader);
            
            const finalItemsList = [];
            let alreadyDownloadedCount = 0;
            
            for (const itemKey of itemsToDownload) {
                let fileName = '';
                if (mode === 'surah') {
                    const surahNum = parseInt(itemKey);
                    const surahStr = String(surahNum).padStart(3, '0');
                    fileName = `${sanitizedId}_${surahStr}.mp3`;
                    if (downloadedSet.has(fileName)) {
                        alreadyDownloadedCount++;
                    } else {
                        finalItemsList.push({ surah: surahNum });
                    }
                } else {
                    const [surah, ayah] = itemKey.split('_').map(Number);
                    fileName = `${sanitizedId}_${surah}_${ayah}.mp3`;
                    if (downloadedSet.has(fileName)) {
                        alreadyDownloadedCount++;
                    } else {
                        finalItemsList.push({ surah, ayah });
                    }
                }
            }
            
            if (finalItemsList.length === 0 && itemsToDownload.size > 0) {
                showToast('جميع العناصر المحددة محملة مسبقاً');
                setIsDownloading(false);
                return;
            }
            
            if (alreadyDownloadedCount > 0) {
                showToast(`تم تخطي ${alreadyDownloadedCount} ${mode === 'surah' ? 'سورة' : 'آية'} محملة مسبقاً`);
            }
            
            finalItemsList.sort((a, b) => {
                if (a.surah !== b.surah) return a.surah - b.surah;
                return (a.ayah || 0) - (b.ayah || 0);
            });
            
            let downloaded = 0;
            const totalItems = finalItemsList.length;
            
            for (const item of finalItemsList) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                if (mode === 'surah') {
                    await downloadSurahFile(selectedReader, item.surah);
                } else {
                    await downloadAyah(selectedReader, item.surah, item.ayah!);
                }
                downloaded++;
                setProgress((downloaded / totalItems) * 100);
                setStatus(`جاري التحميل - ${Math.round((downloaded / totalItems) * 100)}%`);
            }
            
            setStatus('تم التحميل بنجاح!');
            setProgress(100);
            showToast('تم التحميل بنجاح!');
            
            checkDownloads();
            
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message === 'Aborted') {
                setStatus('تم إيقاف التحميل');
                showToast('تم إيقاف التحميل');
            } else {
                setStatus(`خطأ: ${error.message}`);
                showToast(`خطأ: ${error.message}`);
            }
        } finally {
            setIsDownloading(false);
            abortControllerRef.current = null;
        }
    };

    const stopDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const downloadSpecificSurah = async (readerId: string, surahNumber: number) => {
        const surah = quranData.surahs.find((s: any) => s.number === surahNumber);
        if (!surah) throw new Error('Surah not found');

        const totalAyahs = surah.ayahs.length;
        for (let i = 1; i <= totalAyahs; i++) {
            if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
            
            await downloadAyah(readerId, surahNumber, i);
            setProgress((i / totalAyahs) * 100);
            setStatus(`جاري تحميل سورة ${surah.name} - آية ${i}/${totalAyahs}`);
        }
    };

    const downloadEntireQuran = async (readerId: string) => {
        let totalAyahs = 6236; // Approx
        let downloaded = 0;
        
        for (const surah of quranData.surahs) {
            for (let i = 1; i <= surah.ayahs.length; i++) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                await downloadAyah(readerId, surah.number, i);
                downloaded++;
                setProgress((downloaded / totalAyahs) * 100);
                setStatus(`جاري تحميل المصحف كاملاً - ${Math.round((downloaded / totalAyahs) * 100)}%`);
            }
        }
    };

    const downloadAyah = async (readerId: string, surah: number, ayah: number) => {
        if (!readerId) return;
        const surahStr = String(surah).padStart(3, '0');
        const ayahStr = String(ayah).padStart(3, '0');
        const url = `https://everyayah.com/data/${readerId}/${surahStr}${ayahStr}.mp3`;
        const sanitizedId = getSanitizedReaderId(readerId);
        const fileName = `${sanitizedId}_${surah}_${ayah}.mp3`;
        
        try {
            if ('caches' in window) {
                const cache = await caches.open('quran-audio-cache');
                const match = await cache.match(url);
                if (match) {
                    const blob = await match.blob();
                    storeAudioOffline(fileName, blob);
                    return;
                }

                const response = await fetch(url, { signal: abortControllerRef.current?.signal });
                if (!response.ok) throw new Error(`فشل التحميل: ${response.status} ${response.statusText}`);
                
                const blob = await response.blob();
                if (blob.size < 1000) return;
                
                await cache.put(url, new Response(blob, {
                    headers: { 'Content-Type': 'audio/mpeg' }
                }));
                storeAudioOffline(fileName, blob);
            }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') {
                console.error('Download Ayah Error:', e);
                throw e;
            }
        }
    };

    const downloadSurahFile = async (readerId: string, surah: number) => {
        if (!readerId) return;
        const surahStr = String(surah).padStart(3, '0');
        let url = '';
        if (readerId.startsWith('http')) {
            const baseUrl = readerId.endsWith('/') ? readerId.slice(0, -1) : readerId;
            url = `${baseUrl}/${surahStr}.mp3`;
        } else {
            url = `https://everyayah.com/data/${readerId}/${surahStr}.mp3`;
        }
        const sanitizedId = getSanitizedReaderId(readerId);
        const fileName = `${sanitizedId}_${surahStr}.mp3`;
        
        try {
            if ('caches' in window) {
                const cache = await caches.open('quran-audio-cache');
                const match = await cache.match(url);
                if (match) {
                    const blob = await match.blob();
                    storeAudioOffline(fileName, blob);
                    return;
                }

                const response = await fetch(url, { signal: abortControllerRef.current?.signal });
                if (!response.ok) throw new Error(`فشل التحميل: ${response.status} ${response.statusText}`);
                
                const blob = await response.blob();
                if (blob.size < 1000) return;

                await cache.put(url, new Response(blob, {
                    headers: { 'Content-Type': 'audio/mpeg' }
                }));
                storeAudioOffline(fileName, blob);
            }
        } catch (e) {
            if ((e as Error).name !== 'AbortError') {
                console.error('Download Surah Error:', e);
                throw e;
            }
        }
    };

    useEffect(() => {
        const handleVoiceCommand = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { action, params, text } = customEvent.detail;
            
            if (action === 'go_to_surah' && params?.surah) {
                toggleSurah(params.surah.toString());
            } else if (action === 'go_to_juz' && params?.juz) {
                toggleJuz(params.juz.toString());
            } else if (action === 'download') {
                if (selectedReader && (selectedSurahs.length > 0 || selectedJuzs.length > 0)) {
                    downloadSelected();
                } else {
                    showToast('الرجاء اختيار القارئ والسورة/الجزء أولاً');
                }
            } else if (action === 'cancel') {
                if (isDownloading) {
                    stopDownload();
                } else {
                    onClose();
                }
            } else if (action === 'ui_discovery' && text) {
                const normalizedText = normalizeArabic(text);
                const reader = readersList.find(r => normalizeArabic(r.name).includes(normalizedText) || normalizedText.includes(normalizeArabic(r.name)));
                if (reader) {
                    setSelectedReader(reader.id);
                }
            }
        };

        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, [selectedReader, selectedSurahs, selectedJuzs, isDownloading, toggleSurah, toggleJuz, downloadSelected, stopDownload, onClose]);

    return (
        <div className={`fixed inset-0 bg-transparent z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="p-3 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر القارئ</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {readersList.map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => setSelectedReader(r.id)}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedReader === r.id ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {r.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر السور (يمكنك اختيار أكثر من سورة)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                <button 
                                    onClick={() => toggleSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${selectedSurahs.includes('all') ? 'theme-btn-bg border-transparent' : downloadedSurahs.length === 114 ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                >
                                    {downloadedSurahs.length === 114 && <i className="fa-solid fa-check text-[10px]"></i>}
                                    <span>المصحف كاملاً</span>
                                </button>
                                {quranData?.surahs.map((s: any) => {
                                    const isDownloaded = downloadedSurahs.includes(s.number.toString());
                                    const isSelected = selectedSurahs.includes(s.number.toString());
                                    return (
                                        <button 
                                            key={s.number}
                                            onClick={() => toggleSurah(s.number.toString())}
                                            className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${isSelected ? 'theme-btn-bg border-transparent' : isDownloaded ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px]"></i>}
                                            <span>{s.name.replace('سورة', '').trim()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر الأجزاء (يمكنك اختيار أكثر من جزء)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => {
                                    const isDownloaded = downloadedJuzs.includes(juzNum.toString());
                                    const isSelected = selectedJuzs.includes(juzNum.toString());
                                    return (
                                        <button 
                                            key={juzNum}
                                            onClick={() => toggleJuz(juzNum.toString())}
                                            className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${isSelected ? 'theme-btn-bg border-transparent' : isDownloaded ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px]"></i>}
                                            <span>الجزء {juzNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button onClick={downloadSelected} disabled={!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)} className={`w-full theme-btn-bg py-2.5 rounded-lg shadow font-bold text-sm ${(!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}>تحميل</button>
                        ) : (
                            <div className="mt-2">
                                <div className="text-xs font-bold mb-1">{status}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-emerald-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <button onClick={stopDownload} className="w-full mt-2 bg-red-500 text-white py-1.5 rounded-lg shadow hover:bg-red-600 font-bold text-sm">إيقاف التحميل</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={onClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">إغلاق</button>
                </div>
            </div>
        </div>
    );
};

export const TafsirDownloadModal: React.FC<DownloadModalProps> = ({ onClose, quranData, showToast, isLandscape }) => {
    const [selectedTafsir, setSelectedTafsir] = useState('');
    const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
    const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
    const [downloadedSurahs, setDownloadedSurahs] = useState<string[]>([]);
    const [downloadedJuzs, setDownloadedJuzs] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const checkDownloads = useCallback(async () => {
        if (!selectedTafsir || !quranData) {
            setDownloadedSurahs([]);
            setDownloadedJuzs([]);
            return;
        }
        try {
            const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_tafsir_files') || '[]');
            const downloadedSet = new Set(downloadedFiles.map((f: any) => f.fileName));

            const dSurahs: string[] = [];
            for (const surah of quranData.surahs) {
                if (downloadedSet.has(`${selectedTafsir}_${surah.number}_tafsir.json`)) {
                    dSurahs.push(surah.number.toString());
                }
            }

            const dJuzs: string[] = [];
            for (let j = 1; j <= 30; j++) {
                const ayahs = getAyahsForJuz(j, quranData);
                const surahsInJuz = new Set(ayahs.map(a => a.surah));
                let allSurahsDownloaded = true;
                for (const s of surahsInJuz) {
                    if (!downloadedSet.has(`${selectedTafsir}_${s}_tafsir.json`)) {
                        allSurahsDownloaded = false;
                        break;
                    }
                }
                if (allSurahsDownloaded) dJuzs.push(j.toString());
            }

            setDownloadedSurahs(dSurahs);
            setDownloadedJuzs(dJuzs);
        } catch (e) {
            console.error('Error checking tafsir downloads:', e);
        }
    }, [selectedTafsir, quranData]);

    useEffect(() => {
        checkDownloads();
    }, [checkDownloads]);

    const toggleSurah = (surahNum: string) => {
        if (surahNum === 'all') {
            if (selectedSurahs.includes('all')) {
                setSelectedSurahs([]);
            } else {
                setSelectedSurahs(['all']);
                setSelectedJuzs([]);
            }
            return;
        }
        
        let newSelection = [...selectedSurahs];
        if (newSelection.includes('all')) newSelection = newSelection.filter(s => s !== 'all');
        
        if (newSelection.includes(surahNum)) {
            newSelection = newSelection.filter(s => s !== surahNum);
        } else {
            newSelection.push(surahNum);
        }
        setSelectedSurahs(newSelection);
    };

    const toggleJuz = (juzNum: string) => {
        let newSelection = [...selectedJuzs];
        if (selectedSurahs.includes('all')) setSelectedSurahs(selectedSurahs.filter(s => s !== 'all'));
        
        if (newSelection.includes(juzNum)) {
            newSelection = newSelection.filter(j => j !== juzNum);
        } else {
            newSelection.push(juzNum);
        }
        setSelectedJuzs(newSelection);
    };

    const downloadSelected = async () => {
        if (!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) return;
        
        setIsDownloading(true);
        setStatus('جاري التحضير للتحميل...');
        setProgress(0);
        abortControllerRef.current = new AbortController();

        try {
            let surahsToDownload = new Set<number>();
            
            if (selectedSurahs.includes('all')) {
                for (let i = 1; i <= 114; i++) surahsToDownload.add(i);
            } else {
                selectedSurahs.forEach(s => surahsToDownload.add(parseInt(s)));
                selectedJuzs.forEach(j => {
                    const ayahs = getAyahsForJuz(parseInt(j), quranData);
                    ayahs.forEach(a => surahsToDownload.add(a.surah));
                });
            }

            // Filter out already downloaded surahs
            const finalSurahsToDownload = Array.from(surahsToDownload).filter(s => !downloadedSurahs.includes(s.toString()));

            if (finalSurahsToDownload.length === 0) {
                showToast('جميع التفاسير المحددة محملة مسبقاً');
                setIsDownloading(false);
                return;
            }

            let completed = 0;
            const total = finalSurahsToDownload.length;

            for (const surahNum of finalSurahsToDownload) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                
                setStatus(`جاري تحميل تفسير سورة ${surahNum} (${completed + 1}/${total})`);
                await downloadSpecificTafsir(selectedTafsir, surahNum);
                
                completed++;
                setProgress((completed / total) * 100);
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setStatus('تم التحميل بنجاح!');
            setProgress(100);
            showToast('تم التحميل بنجاح!');
            checkDownloads();
            setSelectedSurahs([]);
            setSelectedJuzs([]);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message === 'Aborted') {
                setStatus('تم إيقاف التحميل');
                showToast('تم إيقاف التحميل');
            } else {
                setStatus(`خطأ: ${error.message}`);
                showToast(`خطأ: ${error.message}`);
            }
        } finally {
            setIsDownloading(false);
            abortControllerRef.current = null;
        }
    };

    const stopDownload = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    };

    const downloadSpecificTafsir = async (tafsirId: string, surahNumber: number) => {
        const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/${tafsirId}`;
        const fileName = `${tafsirId}_${surahNumber}_tafsir.json`;
        
        try {
            const response = await fetch(url, { signal: abortControllerRef.current?.signal });
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            
            storeTafsirOffline(fileName, data.data);
        } catch (e) {
            if ((e as Error).name === 'AbortError') throw e;
            throw new Error('Failed to download tafsir');
        }
    };

    useEffect(() => {
        const handleVoiceCommand = (e: Event) => {
            const customEvent = e as CustomEvent;
            const { action, params, text } = customEvent.detail;
            
            if (action === 'go_to_surah' && params?.surah) {
                toggleSurah(params.surah.toString());
            } else if (action === 'go_to_juz' && params?.juz) {
                toggleJuz(params.juz.toString());
            } else if (action === 'download') {
                if (selectedTafsir && (selectedSurahs.length > 0 || selectedJuzs.length > 0)) {
                    downloadSelected();
                } else {
                    showToast('الرجاء اختيار المفسر والسورة/الجزء أولاً');
                }
            } else if (action === 'cancel') {
                if (isDownloading) {
                    stopDownload();
                } else {
                    onClose();
                }
            } else if (action === 'ui_discovery' && text) {
                const normalizedText = normalizeArabic(text);
                const tafsir = TAFSEERS.find(t => normalizeArabic(t.name).includes(normalizedText) || normalizedText.includes(normalizeArabic(t.name)));
                if (tafsir) {
                    setSelectedTafsir(tafsir.id);
                }
            }
        };

        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, [selectedTafsir, selectedSurahs, selectedJuzs, isDownloading, toggleSurah, toggleJuz, downloadSelected, stopDownload, onClose]);

    return (
        <div className={`fixed inset-0 bg-transparent z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col`} onClick={e => e.stopPropagation()}>
                <div className="p-3 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر التفسير</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {TAFSEERS.filter(t => t.id !== 'ar.jalalayn').map(t => (
                                    <button 
                                        key={t.id}
                                        onClick={() => setSelectedTafsir(t.id)}
                                        className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold ${selectedTafsir === t.id ? 'theme-btn-bg border-transparent' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                    >
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر السور (يمكنك اختيار أكثر من سورة)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                <button 
                                    onClick={() => toggleSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${selectedSurahs.includes('all') ? 'theme-btn-bg border-transparent' : downloadedSurahs.length === 114 ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                >
                                    {downloadedSurahs.length === 114 && <i className="fa-solid fa-check text-[10px]"></i>}
                                    <span>تحديد الكل</span>
                                </button>
                                {quranData?.surahs.map((s: any) => {
                                    const isDownloaded = downloadedSurahs.includes(s.number.toString());
                                    const isSelected = selectedSurahs.includes(s.number.toString()) || selectedSurahs.includes('all');
                                    return (
                                        <button 
                                            key={s.number}
                                            onClick={() => toggleSurah(s.number.toString())}
                                            className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${isSelected ? 'theme-btn-bg border-transparent' : isDownloaded ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px]"></i>}
                                            <span>{s.name.replace('سورة', '').trim()}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="text-right">
                            <label className="text-xs font-bold opacity-70 block mb-2">اختر الأجزاء (يمكنك اختيار أكثر من جزء)</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2 border rounded-lg themed-card-bg custom-scrollbar`} dir="rtl">
                                {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => {
                                    const isDownloaded = downloadedJuzs.includes(juzNum.toString());
                                    const isSelected = selectedJuzs.includes(juzNum.toString());
                                    return (
                                        <button 
                                            key={juzNum}
                                            onClick={() => toggleJuz(juzNum.toString())}
                                            className={`text-[10px] sm:text-xs p-2 rounded-md border transition-all font-bold flex items-center justify-center gap-1 ${isSelected ? 'theme-btn-bg border-transparent' : isDownloaded ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-400' : 'bg-black/5 border-gray-200 dark:border-gray-700'}`}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px]"></i>}
                                            <span>الجزء {juzNum}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button onClick={downloadSelected} disabled={!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0)} className={`w-full theme-btn-bg py-2.5 rounded-lg shadow font-bold text-sm ${(!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) ? 'opacity-50 cursor-not-allowed' : ''}`}>تحميل</button>
                        ) : (
                            <div className="mt-2">
                                <div className="text-xs font-bold mb-1">{status}</div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                </div>
                                <button onClick={stopDownload} className="w-full mt-2 bg-red-500 text-white py-1.5 rounded-lg shadow hover:bg-red-600 font-bold text-sm">إيقاف التحميل</button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3 text-center flex-none themed-card-bg">
                    <button onClick={onClose} className="theme-accent-btn font-bold py-2 px-8 rounded-lg shadow text-sm w-full">إغلاق</button>
                </div>
            </div>
        </div>
    );
};
