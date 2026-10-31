import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { READERS, TAFSEERS, JUZ_MAP, SURAH_INFO, getTafseerDisplayName } from './constants';
import { SURAH_LIST } from '../../data/listenQuranData';
import { normalizeArabic } from '../../utils/voiceParser';
import { getAvailableSurahsForReader, getSurahsForJuz } from '../../utils/listenQuranUtils';
import { getReciterDisplayName, getSurahDisplayName, formatListenNumber } from '../../utils/listenQuranTranslations';

interface DownloadModalProps {
    onClose: () => void;
    quranData: any;
    showToast: (msg: string) => void;
    isLandscape?: boolean;
    mode?: 'ayah' | 'surah';
    readersList?: { id: string, name: string }[];
    initialReaderId?: string;
    getAvailableSurahs?: (readerId: string) => number[];
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

export const QuranDownloadModal: React.FC<DownloadModalProps> = ({ 
    onClose, 
    quranData, 
    showToast, 
    isLandscape, 
    mode = 'ayah', 
    readersList = READERS,
    initialReaderId,
    getAvailableSurahs
}) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const [selectedReader, setSelectedReader] = useState(initialReaderId || readersList[0]?.id || '');
    const [readerSearch, setReaderSearch] = useState('');
    const [selectedSurahs, setSelectedSurahs] = useState<string[]>([]);
    const [selectedJuzs, setSelectedJuzs] = useState<string[]>([]);
    const [downloadedSurahs, setDownloadedSurahs] = useState<string[]>([]);
    const [downloadedJuzs, setDownloadedJuzs] = useState<string[]>([]);
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (initialReaderId && (!selectedReader || selectedReader !== initialReaderId)) {
            setSelectedReader(initialReaderId);
        }
    }, [initialReaderId]);

    const selectedReaderObj = useMemo(() => {
        return readersList.find(r => r.id === selectedReader);
    }, [readersList, selectedReader]);

    const filteredReaders = useMemo(() => {
        if (!readerSearch.trim()) return readersList;
        const query = readerSearch.trim().toLowerCase();
        const normQuery = normalizeArabic(query);
        return readersList.filter(r => {
            const ar = normalizeArabic(r.name.toLowerCase());
            const en = getReciterDisplayName(r.name, 'en').toLowerCase();
            return ar.includes(normQuery) || en.includes(query);
        });
    }, [readersList, readerSearch]);

    // Available surahs for the currently selected reader
    const availableSurahNumbers = useMemo(() => {
        if (!selectedReader) return Array.from({ length: 114 }, (_, i) => i + 1);
        if (mode === 'surah') {
            if (getAvailableSurahs) {
                const res = getAvailableSurahs(selectedReader);
                if (res && res.length > 0) return res;
            }
            const readerObj = readersList.find(r => r.id === selectedReader);
            return getAvailableSurahsForReader(selectedReader, readerObj?.name);
        }
        return Array.from({ length: 114 }, (_, i) => i + 1);
    }, [selectedReader, mode, getAvailableSurahs, readersList]);

    // Base 114 surahs to ensure we can always filter from all surahs regardless of parent quranData
    const baseSurahsList = useMemo(() => {
        if (quranData?.surahs && quranData.surahs.length >= 114) {
            return quranData.surahs;
        }
        return SURAH_LIST.map(s => ({
            number: s.number,
            name: s.name,
            revelationType: SURAH_INFO[s.number]?.type === 'مكية' ? 'Meccan' : 'Medinan',
            ayahs: new Array(SURAH_INFO[s.number]?.ayahs || 0)
        }));
    }, [quranData]);

    // Surahs filtered to only those available for the selected reader
    const availableSurahsList = useMemo(() => {
        return baseSurahsList.filter((s: any) => availableSurahNumbers.includes(s.number));
    }, [baseSurahsList, availableSurahNumbers]);

    const handleSelectReader = (rId: string) => {
        if (rId !== selectedReader) {
            setSelectedReader(rId);
            setSelectedSurahs([]);
            setSelectedJuzs([]);
        }
    };

    const isAllSurahsDownloaded = useMemo(() => {
        return availableSurahsList.length > 0 && availableSurahsList.every((s: any) => downloadedSurahs.includes(s.number.toString()));
    }, [availableSurahsList, downloadedSurahs]);

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
            for (const surah of availableSurahsList) {
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
                if (mode === 'surah') {
                    const surahsInJuz = getSurahsForJuz(j).filter(sNum => availableSurahNumbers.includes(sNum));
                    if (surahsInJuz.length > 0) {
                        let allItemsDownloaded = true;
                        for (const sNum of surahsInJuz) {
                            const surahStr = String(sNum).padStart(3, '0');
                            const fileName = `${sanitizedId}_${surahStr}.mp3`;
                            if (!downloadedSet.has(fileName)) {
                                allItemsDownloaded = false;
                                break;
                            }
                        }
                        if (allItemsDownloaded) dJuzs.push(j.toString());
                    }
                } else {
                    const ayahs = getAyahsForJuz(j, quranData);
                    let allItemsDownloaded = true;
                    for (const a of ayahs) {
                        if (!downloadedSet.has(`${sanitizedId}_${a.surah}_${a.ayah}.mp3`)) {
                            allItemsDownloaded = false;
                            break;
                        }
                    }
                    if (allItemsDownloaded) dJuzs.push(j.toString());
                }
            }

            setDownloadedSurahs(dSurahs);
            setDownloadedJuzs(dJuzs);
        } catch (e) {
            console.error('Error checking downloads:', e);
        }
    }, [selectedReader, quranData, mode, availableSurahsList, availableSurahNumbers]);

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
        const jNum = parseInt(juzNum);
        if (mode === 'surah') {
            const surahsInJuz = getSurahsForJuz(jNum).filter(s => availableSurahNumbers.includes(s));
            if (surahsInJuz.length === 0) {
                showToast('لا توجد سور مسجلة لهذا القارئ في هذا الجزء');
                return;
            }
        }

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
                for (const surah of availableSurahsList) {
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
                    if (mode === 'surah') {
                        if (availableSurahNumbers.includes(surahNum)) {
                            itemsToDownload.add(`${surahNum}`);
                        }
                    } else {
                        const surah = quranData.surahs.find((s: any) => s.number === surahNum);
                        if (surah) {
                            for (let i = 1; i <= surah.ayahs.length; i++) {
                                itemsToDownload.add(`${surahNum}_${i}`);
                            }
                        }
                    }
                }
                
                for (const juzNumStr of selectedJuzs) {
                    const juzNum = parseInt(juzNumStr);
                    if (mode === 'surah') {
                        const surahsInJuz = getSurahsForJuz(juzNum).filter(sNum => availableSurahNumbers.includes(sNum));
                        for (const sNum of surahsInJuz) {
                            itemsToDownload.add(`${sNum}`);
                        }
                    } else {
                        const ayahs = getAyahsForJuz(juzNum, quranData);
                        for (const a of ayahs) {
                            itemsToDownload.add(`${a.surah}_${a.ayah}`);
                        }
                    }
                }
            }
            
            const downloadedFiles = JSON.parse(localStorage.getItem('downloaded_audio_files') || '[]');
            const downloadedSet = new Set(downloadedFiles.map((f: any) => f.fileName));
            const sanitizedId = getSanitizedReaderId(selectedReader);
            
            const finalItemsList: { surah: number; ayah?: number }[] = [];
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
            let failedCount = 0;
            const totalItems = finalItemsList.length;
            
            for (const item of finalItemsList) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                const surahName = SURAH_LIST.find(s => s.number === item.surah)?.name || `سورة ${item.surah}`;
                if (mode === 'surah') {
                    setStatus(`جاري تحميل ${surahName} (${downloaded + 1}/${totalItems}) - ${Math.round(((downloaded + failedCount) / totalItems) * 100)}%`);
                } else {
                    setStatus(`جاري تحميل آية ${item.ayah} من ${surahName} (${downloaded + 1}/${totalItems}) - ${Math.round(((downloaded + failedCount) / totalItems) * 100)}%`);
                }

                try {
                    if (mode === 'surah') {
                        await downloadSurahFile(selectedReader, item.surah);
                    } else {
                        await downloadAyah(selectedReader, item.surah, item.ayah!);
                    }
                    downloaded++;
                } catch (err: any) {
                    if (err.name === 'AbortError' || err.message === 'Aborted') {
                        throw err;
                    }
                    console.warn(`Surah download error ${item.surah}:`, err);
                    failedCount++;
                }
                setProgress(((downloaded + failedCount) / totalItems) * 100);
            }
            
            setProgress(100);
            if (failedCount === 0) {
                setStatus('تم التحميل بنجاح!');
                showToast('تم التحميل بنجاح!');
            } else if (downloaded > 0) {
                setStatus(`تم تحميل ${downloaded} عنصر (تعذر ${failedCount})`);
                showToast(`تم تحميل ${downloaded} عنصر (تعذر ${failedCount})`);
            } else {
                setStatus('تعذر تحميل العناصر');
                showToast('تعذر تحميل العناصر');
            }
            
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
        
        for (const surah of availableSurahsList) {
            for (let i = 1; i <= surah.ayahs.length; i++) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                await downloadAyah(readerId, surah.number, i);
                downloaded++;
                setProgress((downloaded / totalAyahs) * 100);
                setStatus(`جاري تحميل المصحف - ${Math.round((downloaded / totalAyahs) * 100)}%`);
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
                    handleSelectReader(reader.id);
                }
            }
        };

        window.addEventListener('voice-command', handleVoiceCommand);
        return () => window.removeEventListener('voice-command', handleVoiceCommand);
    }, [selectedReader, selectedSurahs, selectedJuzs, isDownloading, toggleSurah, toggleJuz, downloadSelected, stopDownload, onClose]);

    const isDark = !theme.bgColor || 
        ['#191D3A', '#0C0A09', '#000000', '#4C1D95', '#7C2D12', '#1E40AF', '#1E1B4B', '#1C1917', '#0B0F19', '#3E2723', '#450A0A', '#064E3B', '#0F766E', '#155E75', '#581C87', '#0F172A', '#2E1065', '#0B0F19', '#022C22'].includes(theme.bgColor.toUpperCase());

    const modalStyle = {
        '--qr-bg': theme.bg || theme.bgColor || '#ffffff',
        '--qr-text': theme.text || theme.textColor || '#000000',
        '--qr-card-bg': theme.cardBg || (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'),
        '--qr-card-text': theme.cardText || theme.text || theme.textColor || '#000000',
        '--qr-card-border': theme.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)'),
        '--qr-modal-bg': theme.modalBg || theme.bg || theme.bgColor || '#ffffff',
        '--qr-modal-text': theme.modalText || theme.text || theme.textColor || '#000000',
        '--qr-header-bg': theme.headerBg || theme.bg || '#ffffff',
        '--qr-header-text': theme.headerText || theme.text || '#000000',
    } as React.CSSProperties;

    return (
        <div style={modalStyle} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col border-0`} onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--qr-bg)', color: 'var(--qr-text)', border: 'none', outline: 'none' }}>
                <div className="p-4 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className={isRTL ? "text-right" : "text-left"}>
                            <div className="flex justify-between items-center mb-1.5" dir={dir}>
                                <label className="text-xs font-bold opacity-70">
                                    {language === 'en' ? 'Select Reciter' : 'اختر القارئ'}
                                </label>
                                {selectedReaderObj && (
                                    <span className="text-[10px] font-bold" style={{ color: 'var(--qr-accent)' }}>
                                        {availableSurahsList.length < 114 
                                            ? (language === 'en' ? `(Available: ${formatListenNumber(availableSurahsList.length, language)} Surahs)` : `(متوفر: ${formatListenNumber(availableSurahsList.length, language)} سورة)`) 
                                            : (language === 'en' ? '(Complete Qur\'an)' : '(المصحف كامل)')}
                                    </span>
                                )}
                            </div>
                            
                            {/* Reader search input */}
                            <div className="relative mb-2">
                                <input
                                    type="text"
                                    value={readerSearch}
                                    onChange={(e) => setReaderSearch(e.target.value)}
                                    placeholder={language === 'en' ? 'Search reciters...' : 'ابحث عن قارئ...'}
                                    className={`w-full py-2 ${isRTL ? 'pr-8 pl-3 text-right' : 'pl-8 pr-3 text-left'} text-xs rounded-xl quran-raised-card outline-none border-0`}
                                    style={{ border: 'none', outline: 'none' }}
                                    dir={dir}
                                />
                                <i className={`fa-solid fa-magnifying-glass absolute ${isRTL ? 'right-2.5' : 'left-2.5'} top-3 text-xs opacity-50`}></i>
                                {readerSearch && (
                                    <button 
                                        onClick={() => setReaderSearch('')} 
                                        className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-2.5 text-xs opacity-50 hover:opacity-100 cursor-pointer`}
                                    >
                                        <i className="fa-solid fa-xmark"></i>
                                    </button>
                                )}
                            </div>

                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-48'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                {filteredReaders.map(r => {
                                    const isSelected = selectedReader === r.id;
                                    return (
                                        <button 
                                            key={r.id}
                                            onClick={() => handleSelectReader(r.id)}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold cursor-pointer truncate ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                            style={{ 
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : undefined,
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : theme.textColor,
                                                border: 'none'
                                            }}
                                            title={getReciterDisplayName(r.name, language)}
                                        >
                                            {getReciterDisplayName(r.name, language)}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Informational banner when reciter has incomplete mushaf */}
                            {selectedReaderObj && availableSurahsList.length < 114 && (
                                <div className={`flex items-start gap-2 p-3 rounded-2xl quran-raised-card text-amber-700 dark:text-amber-300 text-[11px] ${isRTL ? 'text-right' : 'text-left'} mt-2 animate-fadeIn border-0`} style={{ border: 'none' }} dir={dir}>
                                    <i className="fa-solid fa-triangle-exclamation shrink-0 text-amber-500 text-xs mt-0.5 quran-3d-icon"></i>
                                    <div>
                                        <span className="font-bold">
                                            {language === 'en' 
                                                ? `Notice for (${getReciterDisplayName(selectedReaderObj.name, language)}): ` 
                                                : `تنبيه للقارئ (${selectedReaderObj.name}): `}
                                        </span>
                                        <span>
                                            {language === 'en'
                                                ? `Only ${formatListenNumber(availableSurahsList.length, language)} of 114 Surahs are available for this reciter. Surah and Juz selections have been adjusted to available files only.`
                                                : `مسجل له ${formatListenNumber(availableSurahsList.length, language)} سورة فقط من أصل 114 سورة. تم ضبط قائمة السور والأجزاء لتشمل فقط ما هو متوفر له تفادياً لتوقف التحميل.`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className={isRTL ? "text-right" : "text-left"}>
                            <div className="flex justify-between items-center mb-2" dir={dir}>
                                <label className="text-xs font-bold opacity-70">
                                    {language === 'en' 
                                        ? (availableSurahsList.length < 114 ? `Select Surahs (Available: ${formatListenNumber(availableSurahsList.length, language)})` : 'Select Surahs (Multiple selection allowed)')
                                        : (availableSurahsList.length < 114 ? `اختر السور (المتاح لهذا القارئ: ${formatListenNumber(availableSurahsList.length, language)} سورة فقط)` : 'اختر السور (يمكنك اختيار أكثر من سورة)')}
                                </label>
                                {selectedSurahs.length > 0 && !selectedSurahs.includes('all') && (
                                    <span className="text-[10px] opacity-60 font-medium">
                                        {language === 'en' ? `Selected: ${formatListenNumber(selectedSurahs.length, language)} Surahs` : `محدد: ${formatListenNumber(selectedSurahs.length, language)} سورة`}
                                    </span>
                                )}
                            </div>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                <button 
                                    onClick={() => toggleSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${selectedSurahs.includes('all') ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                    style={{
                                        backgroundColor: selectedSurahs.includes('all') ? 'var(--qr-accent)' : (isAllSurahsDownloaded ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                        color: selectedSurahs.includes('all') ? 'var(--qr-accent-text, #fff)' : (isAllSurahsDownloaded ? 'var(--qr-accent)' : theme.textColor),
                                        border: 'none'
                                    }}
                                >
                                    {isAllSurahsDownloaded && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                    <span>
                                        {language === 'en'
                                            ? (availableSurahsList.length < 114 ? `All Available (${formatListenNumber(availableSurahsList.length, language)})` : 'Complete Qur\'an')
                                            : (availableSurahsList.length < 114 ? `السور المتاحة كاملة (${formatListenNumber(availableSurahsList.length, language)})` : 'المصحف كاملًا')}
                                    </span>
                                </button>
                                {availableSurahsList.map((s: any) => {
                                    const isDownloaded = downloadedSurahs.includes(s.number.toString());
                                    const isSelected = selectedSurahs.includes(s.number.toString());
                                    const surahNameDisplay = language === 'en' ? getSurahDisplayName(s.number, 'en') : s.name.replace('سورة', '').trim();
                                    return (
                                        <button 
                                            key={s.number} 
                                            onClick={() => toggleSurah(s.number.toString())}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1 cursor-pointer truncate ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                            style={{
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : (isDownloaded ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : (isDownloaded ? 'var(--qr-accent)' : theme.textColor),
                                                border: 'none'
                                            }}
                                            title={surahNameDisplay}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                            <span className="truncate">{surahNameDisplay}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={isRTL ? "text-right" : "text-left"}>
                            <div className="flex justify-between items-center mb-2" dir={dir}>
                                <label className="text-xs font-bold opacity-70">
                                    {language === 'en'
                                        ? (availableSurahsList.length < 114 ? 'Select Juzs (Adjusted to available surahs only)' : 'Select Juzs (Multiple selection allowed)')
                                        : (availableSurahsList.length < 114 ? 'اختر الأجزاء (يتم تعديل كل جزء ليشمل السور المتوفرة فقط)' : 'اختر الأجزاء (يمكنك اختيار أكثر من جزء)')}
                                </label>
                                {selectedJuzs.length > 0 && (
                                    <span className="text-[10px] opacity-60 font-medium">
                                        {language === 'en' ? `Selected: ${formatListenNumber(selectedJuzs.length, language)} Juzs` : `محدد: ${formatListenNumber(selectedJuzs.length, language)} جزء`}
                                    </span>
                                )}
                            </div>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => {
                                    const isDownloaded = downloadedJuzs.includes(juzNum.toString());
                                    const isSelected = selectedJuzs.includes(juzNum.toString());
                                    const allSurahsInThisJuz = getSurahsForJuz(juzNum);
                                    const availableInThisJuz = allSurahsInThisJuz.filter(s => availableSurahNumbers.includes(s));
                                    const isUnavailable = mode === 'surah' && availableInThisJuz.length === 0;
                                    const isPartialJuz = mode === 'surah' && availableInThisJuz.length > 0 && availableInThisJuz.length < allSurahsInThisJuz.length;

                                    return (
                                        <button 
                                            key={juzNum}
                                            disabled={isUnavailable}
                                            onClick={() => {
                                                if (isUnavailable) return;
                                                toggleJuz(juzNum.toString());
                                                if (isPartialJuz && !isSelected) {
                                                    showToast(language === 'en' 
                                                        ? `Juz ${juzNum} adjusted to include ${availableInThisJuz.length} available surahs only`
                                                        : `تم تعديل الجزء ${juzNum} ليشمل ${availableInThisJuz.length} سورة متوفرة فقط لهذا القارئ`);
                                                }
                                            }}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex flex-col items-center justify-center gap-0.5 cursor-pointer ${isSelected ? 'quran-raised-btn-selected shadow-md' : (isUnavailable ? 'opacity-40 cursor-not-allowed quran-raised-card' : 'quran-raised-btn')}`}
                                            style={{
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : (isDownloaded ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : (isDownloaded ? 'var(--qr-accent)' : theme.textColor),
                                                border: 'none'
                                            }}
                                        >
                                            <div className="flex items-center gap-1">
                                                {isDownloaded && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                                <span>{language === 'en' ? `Juz ${formatListenNumber(juzNum, language)}` : `الجزء ${formatListenNumber(juzNum, language)}`}</span>
                                            </div>
                                            {isUnavailable ? (
                                                <span className="text-[9px] opacity-60 font-normal text-red-500/80">
                                                    {language === 'en' ? 'Unavailable' : 'غير متوفر'}
                                                </span>
                                            ) : isPartialJuz ? (
                                                <span className="text-[9px] text-amber-500 dark:text-amber-400 font-normal">
                                                    {language === 'en' ? `(${formatListenNumber(availableInThisJuz.length, language)} available)` : `(${formatListenNumber(availableInThisJuz.length, language)} سورة متوفرة)`}
                                                </span>
                                            ) : null}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button 
                                onClick={downloadSelected} 
                                disabled={!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0) || (() => {
                                    if (selectedSurahs.includes('all')) return isAllSurahsDownloaded;
                                    const allSelection = [
                                        ...selectedSurahs, 
                                        ...(mode === 'surah'
                                            ? selectedJuzs.flatMap(j => getSurahsForJuz(parseInt(j)).filter(s => availableSurahNumbers.includes(s)).map(String))
                                            : selectedJuzs.flatMap(j => getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString())))
                                    ];
                                    if (allSelection.length === 0) return false;
                                    return allSelection.every(s => downloadedSurahs.includes(s));
                                })()} 
                                className={`w-full py-3.5 rounded-xl shadow-lg font-bold text-sm cursor-pointer border-0 ${(!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0) || (() => {
                                    if (selectedSurahs.includes('all')) return isAllSurahsDownloaded;
                                    const allSelection = [
                                        ...selectedSurahs, 
                                        ...(mode === 'surah'
                                            ? selectedJuzs.flatMap(j => getSurahsForJuz(parseInt(j)).filter(s => availableSurahNumbers.includes(s)).map(String))
                                            : selectedJuzs.flatMap(j => getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString())))
                                    ];
                                    if (allSelection.length === 0) return false;
                                    return allSelection.every(s => downloadedSurahs.includes(s));
                                })()) ? 'opacity-50 cursor-not-allowed grayscale quran-raised-card' : 'quran-raised-btn-selected'}`}
                                style={{
                                    backgroundColor: 'var(--qr-accent)',
                                    color: 'var(--qr-accent-text, #fff)',
                                    border: 'none'
                                }}
                            >
                                {(() => {
                                    const dlText = language === 'en' ? 'Download' : 'تحميل';
                                    const dldText = language === 'en' ? 'Downloaded' : 'محمل';
                                    if (!selectedReader || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) return dlText;
                                    if (selectedSurahs.includes('all')) return isAllSurahsDownloaded ? dldText : dlText;
                                    const allSelection = [
                                        ...selectedSurahs, 
                                        ...(mode === 'surah'
                                            ? selectedJuzs.flatMap(j => getSurahsForJuz(parseInt(j)).filter(s => availableSurahNumbers.includes(s)).map(String))
                                            : selectedJuzs.flatMap(j => getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString())))
                                    ];
                                    if (allSelection.length > 0 && allSelection.every(s => downloadedSurahs.includes(s))) return dldText;
                                    return dlText;
                                })()}
                            </button>
                        ) : (
                            <div className="mt-2 p-3.5 rounded-2xl quran-raised-card border-0" style={{ border: 'none' }}>
                                <div className="flex items-center justify-between text-xs font-bold mb-2" dir={dir}>
                                    <span className={`truncate ${isRTL ? 'text-right' : 'text-left'}`}>{status}</span>
                                    <span className="shrink-0">{formatListenNumber(Math.round(progress), language)}%</span>
                                </div>
                                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: 'var(--qr-accent)' }}></div>
                                </div>
                                <div className="text-[10px] opacity-70 mt-2 text-center">
                                    {language === 'en' ? 'Downloading available Surahs for this reciter only' : 'جاري تحميل السور المتوفرة للقارئ فقط'}
                                </div>
                                <button onClick={stopDownload} className="w-full mt-3 quran-raised-btn bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl shadow font-bold text-xs transition-colors cursor-pointer border-0" style={{ border: 'none' }}>
                                    {language === 'en' ? 'Stop Download' : 'إيقاف التحميل'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3.5 text-center flex-none">
                    <button 
                        onClick={onClose} 
                        style={{ backgroundColor: 'var(--qr-accent)', color: 'var(--qr-accent-text, #fff)', border: 'none' }}
                        className="quran-raised-btn-selected font-bold py-2.5 px-8 rounded-xl shadow-lg text-sm w-full cursor-pointer border-0"
                    >
                        {language === 'en' ? 'Close' : 'إغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const TafsirDownloadModal: React.FC<DownloadModalProps> = ({ onClose, quranData, showToast, isLandscape }) => {
    const { theme, themeKey } = useTheme();
    const { language, isRTL, dir } = useLanguage();
    const isEn = language === 'en';
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
        setStatus(isEn ? 'Preparing download...' : 'جاري التحضير للتحميل...');
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
                showToast(isEn ? 'All selected Tafseers are already downloaded' : 'جميع التفاسير المحددة محملة مسبقاً');
                setIsDownloading(false);
                return;
            }

            let completed = 0;
            const total = finalSurahsToDownload.length;

            for (const surahNum of finalSurahsToDownload) {
                if (abortControllerRef.current?.signal.aborted) throw new Error('Aborted');
                
                const surahNameDisplay = isEn ? getSurahDisplayName(surahNum, 'en') : `سورة ${surahNum}`;
                setStatus(isEn ? `Downloading Tafseer for ${surahNameDisplay} (${completed + 1}/${total})` : `جاري تحميل تفسير سورة ${surahNum} (${completed + 1}/${total})`);
                await downloadSpecificTafsir(selectedTafsir, surahNum);
                
                completed++;
                setProgress((completed / total) * 100);
                
                // Small delay to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setStatus(isEn ? 'Downloaded successfully!' : 'تم التحميل بنجاح!');
            setProgress(100);
            showToast(isEn ? 'Downloaded successfully!' : 'تم التحميل بنجاح!');
            checkDownloads();
            setSelectedSurahs([]);
            setSelectedJuzs([]);
        } catch (error: any) {
            if (error.name === 'AbortError' || error.message === 'Aborted') {
                setStatus(isEn ? 'Download stopped' : 'تم إيقاف التحميل');
                showToast(isEn ? 'Download stopped' : 'تم إيقاف التحميل');
            } else {
                setStatus(`${isEn ? 'Error:' : 'خطأ:'} ${error.message}`);
                showToast(`${isEn ? 'Error:' : 'خطأ:'} ${error.message}`);
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
                    showToast(isEn ? 'Please select Tafseer and Surah/Juz first' : 'الرجاء اختيار المفسر والسورة/الجزء أولاً');
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
    }, [selectedTafsir, selectedSurahs, selectedJuzs, isDownloading, toggleSurah, toggleJuz, downloadSelected, stopDownload, onClose, isEn]);

    const isDark = !theme.bgColor || 
        ['#191D3A', '#0C0A09', '#000000', '#4C1D95', '#7C2D12', '#1E40AF', '#1E1B4B', '#1C1917', '#0B0F19', '#3E2723', '#450A0A', '#064E3B', '#0F766E', '#155E75', '#581C87', '#0F172A', '#2E1065', '#0B0F19', '#022C22'].includes(theme.bgColor.toUpperCase());

    const modalStyle = {
        '--qr-bg': theme.bg || theme.bgColor || '#ffffff',
        '--qr-text': theme.text || theme.textColor || '#000000',
        '--qr-card-bg': theme.cardBg || (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.5)'),
        '--qr-card-text': theme.cardText || theme.text || theme.textColor || '#000000',
        '--qr-card-border': theme.cardBorder || (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.07)'),
        '--qr-modal-bg': theme.modalBg || theme.bg || theme.bgColor || '#ffffff',
        '--qr-modal-text': theme.modalText || theme.text || theme.textColor || '#000000',
        '--qr-header-bg': theme.headerBg || theme.bg || '#ffffff',
        '--qr-header-text': theme.headerText || theme.text || '#000000',
     } as React.CSSProperties;

    return (
        <div style={modalStyle} className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200] flex items-center justify-center ${isLandscape ? 'p-0' : 'p-4'} animate-fadeIn`} onClick={onClose}>
            <div dir={dir} className={`modal-skinned w-full ${isLandscape ? 'max-w-4xl h-full rounded-none max-h-screen' : 'max-w-md rounded-2xl max-h-[90vh]'} shadow-2xl overflow-hidden flex flex-col border-0`} onClick={e => e.stopPropagation()} style={{ backgroundColor: 'var(--qr-bg)', color: 'var(--qr-text)', border: 'none', outline: 'none' }}>
                <div className="p-4 space-y-4 overflow-y-auto text-center flex-1">
                    <div className="space-y-4">
                        <div className={isRTL ? "text-right" : "text-left"}>
                            <label className="text-xs font-bold opacity-70 block mb-2">{isEn ? 'Select Tafseer' : 'اختر التفسير'}</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-40' : 'max-h-60'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                {TAFSEERS.filter(t => t.id !== 'ar.jalalayn').map(t => {
                                    const isSelected = selectedTafsir === t.id;
                                    const tafseerName = getTafseerDisplayName(t.id, isEn ? 'en' : 'ar');
                                    return (
                                        <button 
                                            key={t.id}
                                            onClick={() => setSelectedTafsir(t.id)}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold cursor-pointer ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                            style={{
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : undefined,
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : theme.textColor,
                                                border: 'none'
                                            }}
                                            title={tafseerName}
                                        >
                                            {tafseerName}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={isRTL ? "text-right" : "text-left"}>
                            <label className="text-xs font-bold opacity-70 block mb-2">{isEn ? 'Select Surahs (Multiple selection allowed)' : 'اختر السور (يمكنك اختيار أكثر من سورة)'}</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                <button 
                                    onClick={() => toggleSurah('all')}
                                    className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${selectedSurahs.includes('all') ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                    style={{
                                        backgroundColor: selectedSurahs.includes('all') ? 'var(--qr-accent)' : (downloadedSurahs.length === 114 ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                        color: selectedSurahs.includes('all') ? 'var(--qr-accent-text, #fff)' : (downloadedSurahs.length === 114 ? 'var(--qr-accent)' : theme.textColor),
                                        border: 'none'
                                    }}
                                >
                                    {downloadedSurahs.length === 114 && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                    <span>{isEn ? 'Select All' : 'تحديد الكل'}</span>
                                </button>
                                {quranData?.surahs.map((s: any) => {
                                    const isDownloaded = downloadedSurahs.includes(s.number.toString());
                                    const isSelected = selectedSurahs.includes(s.number.toString()) || selectedSurahs.includes('all');
                                    const surahNameDisplay = isEn ? getSurahDisplayName(s.number, 'en') : s.name.replace('سورة', '').trim();
                                    return (
                                        <button 
                                            key={s.number}
                                            onClick={() => toggleSurah(s.number.toString())}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1 cursor-pointer truncate ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                            style={{
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : (isDownloaded ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : (isDownloaded ? 'var(--qr-accent)' : theme.textColor),
                                                border: 'none'
                                            }}
                                            title={surahNameDisplay}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                            <span className="truncate">{surahNameDisplay}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className={isRTL ? "text-right" : "text-left"}>
                            <label className="text-xs font-bold opacity-70 block mb-2">{isEn ? 'Select Juzs (Multiple selection allowed)' : 'اختر الأجزاء (يمكنك اختيار أكثر من جزء)'}</label>
                            <div className={`grid ${isLandscape ? 'grid-cols-4 sm:grid-cols-5 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3'} gap-2 ${isLandscape ? 'max-h-32' : 'max-h-40'} overflow-y-auto p-2.5 rounded-2xl quran-raised-card custom-scrollbar border-0`} style={{ border: 'none' }} dir={dir}>
                                {Array.from({length: 30}, (_, i) => i + 1).map(juzNum => {
                                    const isDownloaded = downloadedJuzs.includes(juzNum.toString());
                                    const isSelected = selectedJuzs.includes(juzNum.toString());
                                    return (
                                        <button 
                                            key={juzNum}
                                            onClick={() => toggleJuz(juzNum.toString())}
                                            className={`text-[10px] sm:text-xs p-2.5 rounded-xl transition-all font-bold flex items-center justify-center gap-1 cursor-pointer ${isSelected ? 'quran-raised-btn-selected shadow-md' : 'quran-raised-btn'}`}
                                            style={{
                                                backgroundColor: isSelected ? 'var(--qr-accent)' : (isDownloaded ? 'color-mix(in srgb, var(--qr-accent) 20%, transparent)' : undefined),
                                                color: isSelected ? 'var(--qr-accent-text, #fff)' : (isDownloaded ? 'var(--qr-accent)' : theme.textColor),
                                                border: 'none'
                                            }}
                                        >
                                            {isDownloaded && <i className="fa-solid fa-check text-[10px] quran-3d-icon"></i>}
                                            <span>{isEn ? `Juz ${formatListenNumber(juzNum, 'en')}` : `الجزء ${formatListenNumber(juzNum, 'ar')}`}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        
                        {!isDownloading ? (
                            <button 
                                onClick={downloadSelected} 
                                disabled={!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0) || (() => {
                                    if (selectedSurahs.includes('all')) return downloadedSurahs.length === 114;
                                    const surahsFromJuz = selectedJuzs.flatMap(j => Array.from(new Set(getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString()))));
                                    const allSelection = Array.from(new Set([...selectedSurahs.filter(s => s !== 'all'), ...surahsFromJuz]));
                                    if (allSelection.length === 0) return false;
                                    return allSelection.every(s => downloadedSurahs.includes(s));
                                })()} 
                                className={`w-full py-3.5 rounded-xl shadow-lg font-bold text-sm cursor-pointer border-0 ${(!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0) || (() => {
                                    if (selectedSurahs.includes('all')) return downloadedSurahs.length === 114;
                                    const surahsFromJuz = selectedJuzs.flatMap(j => Array.from(new Set(getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString()))));
                                    const allSelection = Array.from(new Set([...selectedSurahs.filter(s => s !== 'all'), ...surahsFromJuz]));
                                    if (allSelection.length === 0) return false;
                                    return allSelection.every(s => downloadedSurahs.includes(s));
                                })()) ? 'opacity-50 cursor-not-allowed grayscale quran-raised-card' : 'quran-raised-btn-selected'}`}
                                style={{
                                    backgroundColor: 'var(--qr-accent)',
                                    color: 'var(--qr-accent-text, #fff)',
                                    border: 'none'
                                }}
                            >
                                {(() => {
                                    const dlText = isEn ? 'Download' : 'تحميل';
                                    const dldText = isEn ? 'Downloaded' : 'محمل';
                                    if (!selectedTafsir || (selectedSurahs.length === 0 && selectedJuzs.length === 0)) return dlText;
                                    if (selectedSurahs.includes('all')) return downloadedSurahs.length === 114 ? dldText : dlText;
                                    const surahsFromJuz = selectedJuzs.flatMap(j => Array.from(new Set(getAyahsForJuz(parseInt(j), quranData).map(a => a.surah.toString()))));
                                    const allSelection = Array.from(new Set([...selectedSurahs.filter(s => s !== 'all'), ...surahsFromJuz]));
                                    if (allSelection.length > 0 && allSelection.every(s => downloadedSurahs.includes(s))) return dldText;
                                    return dlText;
                                })()}
                            </button>
                        ) : (
                            <div className="mt-2 p-3.5 rounded-2xl quran-raised-card border-0" style={{ border: 'none' }}>
                                <div className="text-xs font-bold mb-2">{status}</div>
                                <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: 'var(--qr-accent)' }}></div>
                                </div>
                                <button onClick={stopDownload} className="w-full mt-3 quran-raised-btn bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl shadow font-bold text-xs cursor-pointer border-0" style={{ border: 'none' }}>
                                    {isEn ? 'Stop Download' : 'إيقاف التحميل'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-3.5 text-center flex-none">
                    <button 
                        onClick={onClose} 
                        style={{ backgroundColor: 'var(--qr-accent)', color: 'var(--qr-accent-text, #fff)', border: 'none' }}
                        className="quran-raised-btn-selected font-bold py-2.5 px-8 rounded-xl shadow-lg text-sm w-full cursor-pointer border-0"
                    >
                        {isEn ? 'Close' : 'إغلاق'}
                    </button>
                </div>
            </div>
        </div>
    );
};
