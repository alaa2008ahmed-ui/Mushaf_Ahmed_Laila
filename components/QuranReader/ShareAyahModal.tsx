import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Plus, Minus, Type, Image as ImageIcon, FileText, Volume2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FONTS, SURAH_NAMES_AR, toArabic, SURAH_INFO, getAyahCountText } from './constants';
import MushafPage, { renderTajweedTextHtml } from './MushafPage';
import SurahHeader from './SurahHeader';

interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
    readingMode?: 'mushaf' | 'tafseer' | 'meanings' | 'translation';
    settings?: any;
    showToast?: (msg: string) => void;
}

const BACKGROUNDS = [
    { id: 'bg_white', type: 'solid', value: '#ffffff', border: '#cccccc', accent: '#000000' },
    { id: 'bg1', type: 'gradient', value: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', border: '#4a72b8', accent: '#FFD700' },
    { id: 'bg2', type: 'gradient', value: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', border: '#58ff9d', accent: '#004D40' },
    { id: 'bg3', type: 'gradient', value: 'linear-gradient(135deg, #8E2DE2 0%, #4A00E0 100%)', border: '#ae4dff', accent: '#00FFCC' },
    { id: 'bg4', type: 'gradient', value: 'linear-gradient(135deg, #FF416C 0%, #FF4B2B 100%)', border: '#ff6b4b', accent: '#FFD700' },
    { id: 'bg5', type: 'gradient', value: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)', border: '#54b8fb', accent: '#FFEB3B' },
    { id: 'bg6', type: 'gradient', value: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)', border: '#4c7384', accent: '#FFCA28' },
    { id: 'bg7', type: 'gradient', value: 'linear-gradient(135deg, #f2709c 0%, #ff9472 100%)', border: '#ffb399', accent: '#880E4F' },
    { id: 'bg8', type: 'gradient', value: 'linear-gradient(135deg, #1D976C 0%, #93F9B9 100%)', border: '#b3fcd0', accent: '#004D40' },
    { id: 'bg9', type: 'gradient', value: 'linear-gradient(135deg, #000000 0%, #434343 100%)', border: '#666666', accent: '#FFD700' },
    { id: 'bg10', type: 'gradient', value: 'linear-gradient(135deg, #5C258D 0%, #4389A2 100%)', border: '#6db3c9', accent: '#FFEB3B' },
    { id: 'bg11', type: 'gradient', value: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)', border: '#8cd19c', accent: '#FFF' },
    { id: 'bg12', type: 'gradient', value: 'linear-gradient(135deg, #ff9966 0%, #ff5e62 100%)', border: '#ffb399', accent: '#FFF' },
    { id: 'bg13', type: 'gradient', value: 'linear-gradient(135deg, #00b09b 0%, #96c93d 100%)', border: '#b8eb5e', accent: '#004D40' },
    { id: 'bg14', type: 'gradient', value: 'linear-gradient(135deg, #8E0E00 0%, #1F1C18 100%)', border: '#b31200', accent: '#FFD700' },
    { id: 'bg15', type: 'gradient', value: 'linear-gradient(135deg, #00C9FF 0%, #92FE9D 100%)', border: '#b3ffc2', accent: '#004D40' },
    { id: 'bg16', type: 'gradient', value: 'linear-gradient(135deg, #fc4a1a 0%, #f7b733 100%)', border: '#ffd266', accent: '#880E4F' },
    { id: 'bg17', type: 'gradient', value: 'radial-gradient(circle at 50% 50%, #1a2a6c, #b21f1f, #fdbb2d)', border: '#fdbb2d', accent: '#FFF' },
    { id: 'bg18', type: 'gradient', value: 'linear-gradient(45deg, #d53369 0%, #daae51 100%)', border: '#daae51', accent: '#FFF' },
    { id: 'bg19', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f2027, #0f2027 10px, #203a43 10px, #203a43 20px)', border: '#4c7384', accent: '#FFD700' },
    { id: 'bg20', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #5c258d 10px), repeating-linear-gradient(#4389a2, #4389a2)', border: '#6db3c9', accent: '#FFF' },
    { id: 'bg21', type: 'pattern', value: 'radial-gradient(circle at 50% 50%, #11998e 2px, transparent 2.5px), radial-gradient(circle at 50% 50%, #38ef7d 2px, transparent 2.5px)', border: '#58ff9d', accent: '#004D40' },
];

const FRAMES = [
    { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent' },
    { id: 'f1', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700' },
    { id: 'f2', name: 'مزدوج أبيض', type: 'double', color: '#ffffff' },
    { id: 'f3', name: 'زوايا ذهبي', type: 'corner-diamonds', color: '#FFD700' },
    { id: 'f4', name: 'زوايا أبيض', type: 'corner-diamonds', color: '#ffffff' },
    { id: 'f5', name: 'محراب ذهبي', type: 'mihrab', color: '#FFD700' },
    { id: 'f6', name: 'محراب أبيض', type: 'mihrab', color: '#ffffff' },
    { id: 'f7', name: 'أنيق ذهبي', type: 'elegant', color: '#FFD700' },
    { id: 'f8', name: 'أنيق أبيض', type: 'elegant', color: '#ffffff' },
];

const FrameOverlay = ({ frame, scale = 1 }: { frame: typeof FRAMES[0], scale?: number }) => {
    if (frame.type === 'none') return null;
    
    const color = frame.color;
    const padding = 10 * scale;
    const borderW = 3 * scale;
    const cornerW = 8 * scale;
    const cornerOffset = -4 * scale;

    if (frame.type === 'double') {
        return <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${borderW}px double ${color}`, borderRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />;
    }
    if (frame.type === 'corner-diamonds') {
        return (
            <div style={{ position: 'absolute', top: `${14 * scale}px`, left: `${14 * scale}px`, right: `${14 * scale}px`, bottom: `${14 * scale}px`, border: `${1 * scale}px solid ${color}`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', top: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, left: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
                <div style={{ position: 'absolute', bottom: `${cornerOffset}px`, right: `${cornerOffset}px`, width: `${cornerW}px`, height: `${cornerW}px`, backgroundColor: color, transform: 'rotate(45deg)' }} />
            </div>
        );
    }
    if (frame.type === 'mihrab') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }} />
        );
    }
    if (frame.type === 'elegant') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${12 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px solid ${color}`, borderRadius: `${8 * scale}px`, opacity: 0.5 }} />
            </div>
        );
    }
    return null;
};

const TEXT_COLORS = [
    '#ffffff', '#000000', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db',
    '#9b59b6', '#e67e22', '#1abc9c', '#ecf0f1', '#95a5a6', '#34495e',
    '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', '#5f27cd'
];

const ShareAyahModal: React.FC<ShareAyahModalProps> = ({
    isOpen,
    onClose,
    currentAyah,
    quranData,
    currentTheme,
    readingMode = 'mushaf',
    settings: propSettings,
    showToast
}) => {
    const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>('image');
    const [fromAyah, setFromAyah] = useState(currentAyah.a);
    const [toAyah, setToAyah] = useState(currentAyah.a);
    const [selectedAyahs, setSelectedAyahs] = useState<{ s: number; a: number }[]>([currentAyah]);
    
    const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
    const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
    const [fontSize, setFontSize] = useState(20);
    const [textColor, setTextColor] = useState(TEXT_COLORS[1]);
    const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
    const [customText, setCustomText] = useState('');
    const [isSharing, setIsSharing] = useState(false);
    const [isCopying, setIsCopying] = useState(false);
    const [showCopySuccess, setShowCopySuccess] = useState(false);
    const [explanationData, setExplanationData] = useState<any>(null);
    const [appSettings, setAppSettings] = useState<any>(null);
    const previewRef = useRef<HTMLDivElement>(null);
    const hiddenImageCaptureRef = useRef<HTMLDivElement>(null);
    const hiddenCaptureRef = useRef<HTMLDivElement>(null);
    const hiddenMushafRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('quran_settings');
        if (saved) {
            try {
                setAppSettings(JSON.parse(saved));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        const fetchExplanation = async () => {
            try {
                let url = '';
                const activeMode = readingMode === 'mushaf' ? (propSettings?.tafseer || 'ar.jalalayn') : readingMode;
                
                if (activeMode === 'tafseer' || activeMode === 'ar.jalalayn') url = '/assets/data/ar.jalalayn.json';
                else if (activeMode === 'meanings' || activeMode === 'tafseer.json') url = '/tafseer.json';
                else if (activeMode === 'translation' || activeMode === 'en.json') url = '/en.json';
                
                if (url) {
                    const res = await fetch(url);
                    const data = await res.json();
                    setExplanationData(data);
                }
            } catch (e) {
                console.error('Error fetching explanation for share:', e);
            }
        };
        fetchExplanation();
    }, [readingMode, propSettings?.tafseer]);

    useEffect(() => {
        if (isOpen) {
            setFromAyah(currentAyah.a);
            setToAyah(currentAyah.a);
            setSelectedAyahs([currentAyah]);
            setSelectedBg(BACKGROUNDS[0]);
            setSelectedFrame(FRAMES[0]);
            setFontSize(20);
            setTextColor(TEXT_COLORS[1]);
            setSelectedFont(FONTS[0].id);
            setCustomText('');
            setShareType('image');
        }
    }, [isOpen, currentAyah]);

    useEffect(() => {
        const start = Math.min(fromAyah, toAyah);
        const end = Math.max(fromAyah, toAyah);
        const newSelected = [];
        for (let a = start; a <= end; a++) {
            newSelected.push({ s: currentAyah.s, a });
        }
        setSelectedAyahs(newSelected);
    }, [fromAyah, toAyah, currentAyah.s]);

    if (!isOpen || !quranData) return null;

    const stripTajweedTags = (text: string) => {
        return text;
    };

    const fixQuranText = (text: string) => {
        if (!text) return "";
        return text.replace(/۞/g, '');
    };

    const getAyahText = (s: number, a: number, strip: boolean = true) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const ayah = surah.ayahs.find((ay: any) => ay.numberInSurah === a);
        if (!ayah) return '';
        let text = strip ? stripTajweedTags(ayah.text) : ayah.text;
        text = fixQuranText(text);
        if (s !== 1 && s !== 9 && a === 1) {
            text = text.replace('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').replace('بِّسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', '').trim();
        }
        return text;
    };

    const getSurahName = (s: number) => {
        return SURAH_NAMES_AR[s - 1] || '';
    };

    const getExplanationText = (s: number, a: number) => {
        if (!explanationData) return '';
        if (readingMode === 'mushaf') return '';
        
        const activeMode = readingMode;

        if (activeMode === 'tafseer' || activeMode === 'ar.jalalayn') {
            return explanationData.data?.surahs?.[s - 1]?.ayahs?.[a - 1]?.text || explanationData[s - 1]?.ayahs?.[a - 1]?.text || '';
        }
        if (activeMode === 'meanings' || activeMode === 'tafseer.json') {
            return explanationData.find((m: any) => m.number === String(s) && m.aya === String(a))?.text || '';
        }
        if (activeMode === 'translation' || activeMode === 'en.json') {
            return explanationData[s - 1]?.verses?.[a - 1]?.translation || '';
        }
        return '';
    };

    const combinedText = selectedAyahs.map(ay => getAyahText(ay.s, ay.a) + ` ﴿${toArabic(ay.a)}﴾`).join(' ');
    const combinedExplanation = selectedAyahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
    const firstAyah = selectedAyahs[0];
    const lastAyah = selectedAyahs[selectedAyahs.length - 1];
    const getSurahMetadata = (s: number) => {
        const surah = quranData.surahs[s - 1];
        if (!surah) return '';
        const revelationType = surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية';
        return `${getAyahCountText(surah.ayahs.length)} | ${revelationType}`;
    };

    const surahInfo = firstAyah.s === lastAyah.s 
        ? (firstAyah.a === lastAyah.a 
            ? `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} (${getSurahMetadata(firstAyah.s)})`
            : `سورة ${getSurahName(firstAyah.s)} - آية ${toArabic(firstAyah.a)} إلى آية ${toArabic(lastAyah.a)} (${getSurahMetadata(firstAyah.s)})`)
        : `سورة ${getSurahName(firstAyah.s)} آية ${toArabic(firstAyah.a)} - سورة ${getSurahName(lastAyah.s)} آية ${toArabic(lastAyah.a)}`;

    const [toolbarHeights, setToolbarHeights] = useState({ top: 56, bottom: 64 });

    useEffect(() => {
        const header = document.getElementById('header');
        const footer = document.getElementById('bottom-bar');
        if (header && footer) {
            setToolbarHeights({
                top: header.offsetHeight,
                bottom: footer.offsetHeight
            });
        }
    }, []);

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        
        let shareText = `${surahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        
        if (shareType === 'page') {
            const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
            
            // Find all ayahs in this page
            const pageAyahs: {s: number, a: number}[] = [];
            quranData.surahs.forEach((surah: any, sIdx: number) => {
                surah.ayahs.forEach((ayah: any) => {
                    if (ayah.page === pageNum) {
                        pageAyahs.push({ s: sIdx + 1, a: ayah.numberInSurah });
                    }
                });
            });
            
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.s === lastPageAyah.s 
                    ? `سورة ${getSurahName(firstPageAyah.s)} - آية ${toArabic(firstPageAyah.a)} إلى آية ${toArabic(lastPageAyah.a)}`
                    : `سورة ${getSurahName(firstPageAyah.s)} آية ${toArabic(firstPageAyah.a)} - سورة ${getSurahName(lastPageAyah.s)} آية ${toArabic(lastPageAyah.a)}`;
            }
            
            shareText = `صفحة ${toArabic(pageNum)} - ${pageSurahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        }
        
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;

        const blobToBase64 = (blob: Blob): Promise<string> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        };

        try {
            if (shareType === 'text') {
                if (Capacitor.isNativePlatform()) {
                    await Share.share({
                        title: 'مشاركة آية',
                        text: fullText,
                        dialogTitle: 'مشاركة عبر'
                    });
                } else if (navigator.share) {
                    await navigator.share({
                        title: 'مشاركة آية',
                        text: fullText,
                    });
                } else {
                    showToast?.("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'image' && hiddenImageCaptureRef.current) {
                try {
                    const captureElement = hiddenImageCaptureRef.current;
                    const originalStyle = captureElement.style.cssText;
                    captureElement.style.position = 'absolute';
                    captureElement.style.left = '0';
                    captureElement.style.top = '0';
                    captureElement.style.visibility = 'visible';
                    captureElement.style.display = 'flex';
                    captureElement.style.zIndex = '-9999';

                    const canvas = await html2canvas(captureElement, {
                        scale: 4,
                        backgroundColor: null,
                        useCORS: true,
                        allowTaint: true,
                        logging: false,
                        imageTimeout: 0
                    });
                    const dataUrl = canvas.toDataURL('image/jpeg', 1.0);
                    
                    captureElement.style.cssText = originalStyle;

                    if (Capacitor.isNativePlatform()) {
                        const fileName = `ayah_share_${Date.now()}.jpg`;
                        const base64Data = dataUrl.split(',')[1];
                        const savedFile = await Filesystem.writeFile({
                            path: fileName,
                            data: base64Data,
                            directory: Directory.Cache,
                        });
                        
                        await Share.share({
                            title: 'مشاركة آية',
                            text: shareText,
                            url: savedFile.uri,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else if (navigator.share) {
                        try {
                            const blob = await (await fetch(dataUrl)).blob();
                            const file = new File([blob], 'ayah.jpg', { type: 'image/jpeg' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    title: 'مشاركة آية',
                                    text: shareText,
                                    files: [file],
                                });
                            } else {
                                await navigator.share({ title: 'مشاركة آية', text: shareText });
                            }
                        } catch (e) {
                            await navigator.share({ title: 'مشاركة آية', text: shareText });
                        }
                    } else {
                        // Fallback: download the image
                        const link = document.createElement('a');
                        link.download = `ayah_${Date.now()}.jpg`;
                        link.href = dataUrl;
                        link.click();
                    }
                } catch (e) {
                    console.error('Error sharing image:', e);
                    showToast?.("حدث خطأ أثناء إنشاء الصورة");
                }
            } else if (shareType === 'page') {
                const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
                
                let captureElement: HTMLElement | null = null;
                if (readingMode === 'mushaf') {
                    captureElement = hiddenMushafRef.current;
                } else {
                    captureElement = hiddenCaptureRef.current;
                }
                
                if (!captureElement) {
                    captureElement = document.getElementById('mushaf-content');
                }
                
                if (captureElement) {
                    try {
                        // Ensure the capture element is visible for capture
                        const originalStyle = captureElement.style.cssText;
                        captureElement.style.position = 'absolute';
                        captureElement.style.left = '0';
                        captureElement.style.top = '0';
                        captureElement.style.visibility = 'visible';
                        captureElement.style.display = 'block';
                        captureElement.style.zIndex = '-9999';

                        const canvas = await html2canvas(captureElement, {
                            scale: 4,
                            backgroundColor: '#ffffff',
                            useCORS: true,
                            allowTaint: true,
                            logging: false,
                            imageTimeout: 0
                        });
                        const dataUrl = canvas.toDataURL('image/jpeg', 1.0);

                        // Restore original style
                        captureElement.style.cssText = originalStyle;

                        if (Capacitor.isNativePlatform()) {
                            const fileName = `quran_page_${pageNum}_${Date.now()}.jpg`;
                            const base64Data = dataUrl.split(',')[1];
                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64Data,
                                directory: Directory.Cache,
                            });
                            
                            await Share.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                                url: savedFile.uri,
                                dialogTitle: 'مشاركة عبر'
                            });
                        } else if (navigator.share) {
                            const blob = await (await fetch(dataUrl)).blob();
                            const file = new File([blob], `page_${pageNum}.jpg`, { type: 'image/jpeg' });
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    title: 'مشاركة صفحة',
                                    text: shareText,
                                    files: [file],
                                });
                            } else {
                                await navigator.share({
                                    title: 'مشاركة صفحة',
                                    text: shareText,
                                });
                            }
                        } else {
                            const link = document.createElement('a');
                            link.download = `page_${pageNum}.jpg`;
                            link.href = dataUrl;
                            link.click();
                        }
                    } catch (e) {
                        console.error('Error capturing page:', e);
                        // Fallback to text share
                        if (Capacitor.isNativePlatform()) {
                            await Share.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                                dialogTitle: 'مشاركة عبر'
                            });
                        } else if (navigator.share) {
                            await navigator.share({
                                title: 'مشاركة صفحة',
                                text: shareText,
                            });
                        }
                    }
                }
            } else if (shareType === 'audio') {
                let reader = propSettings?.reader || appSettings?.reader || 'Alafasy_128kbps';
                // Map some common IDs if they come in different formats
                const readerMap: Record<string, string> = {
                    'ar.alafasy': 'Alafasy_128kbps',
                    'ar.abdulbasitmurattal': 'Abdul_Basit_Murattal_192kbps',
                    'ar.abdulbasitmujawwad': 'Abdul_Basit_Mujawwad_128kbps',
                    'ar.abdullahbasfar': 'Abdullah_Basfar_192kbps',
                    'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
                    'ar.hudhaify': 'Hudhaify_128kbps',
                    'ar.minshawi': 'Minshawy_Murattal_128kbps',
                    'ar.minshawimujawwad': 'Minshawy_Mujawwad_64kbps',
                    'ar.husary': 'Husary_128kbps',
                    'ar.mahermuaiqly': 'MaherAlMuaiqly128kbps',
                    // RECITERS mappings (mp3quran.net to everyayah.com)
                    'https://server11.mp3quran.net/shatri': 'Abu_Bakr_Ash-Shaatree_128kbps',
                    'https://server10.mp3quran.net/ajm': 'Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net',
                    'https://server6.mp3quran.net/akdr': 'Ibrahim_Akhdar_32kbps',
                    'https://server6.mp3quran.net/kurdi': 'Raad_Al_Kurdi_128kbps',
                    'https://server7.mp3quran.net/s_gmd': 'Ghamadi_40kbps',
                    'https://server7.mp3quran.net/shur': 'Saood_ash-Shuraym_128kbps',
                    'https://server6.mp3quran.net/shl': 'Sahl_Yassin_128kbps',
                    'https://server8.mp3quran.net/bu_khtr': 'Salaah_AbdulRahman_Bukhatir_128kbps',
                    'https://server8.mp3quran.net/basit': 'Abdul_Basit_Murattal_192kbps',
                    'https://server11.mp3quran.net/sds': 'Abdurrahmaan_As-Sudais_192kbps',
                    'https://server12.mp3quran.net/kyat': 'Abdullah_Khayat_128kbps',
                    'https://server8.mp3quran.net/mtrod': 'Abdullah_Matroud_128kbps',
                    'https://server9.mp3quran.net/hthfi': 'Hudhaify_128kbps',
                    'https://server8.mp3quran.net/frs_a': 'Fares_Abbad_64kbps',
                    'https://server12.mp3quran.net/maher': 'MaherAlMuaiqly128kbps',
                    'https://server10.mp3quran.net/minsh': 'Minshawy_Murattal_128kbps',
                    'https://server12.mp3quran.net/tblawi': 'Mohammad_al_Tablaway_128kbps',
                    'https://server13.mp3quran.net/husr': 'Husary_128kbps',
                    'https://server8.mp3quran.net/bna': 'Mahmoud_Ali_Al_Banna_32kbps',
                    'https://server8.mp3quran.net/afs': 'Alafasy_128kbps',
                    'https://server8.mp3quran.net/mustafa': 'Mustafa_Ismail_48kbps',
                    'https://server6.mp3quran.net/qtm': 'Nasser_Alqatami_128kbps',
                    'https://server11.mp3quran.net/yasser': 'Yasser_Ad-Dussary_128kbps'
                };
                const audioReader = readerMap[reader] || reader;
                
                // Ensure we have the latest selected ayahs
                const start = Math.min(fromAyah, toAyah);
                const end = Math.max(fromAyah, toAyah);
                const ayahsToShare = [];
                for (let a = start; a <= end; a++) {
                    ayahsToShare.push({ s: currentAyah.s, a });
                }

                // Custom file name: SurahName_AyahRange.mp3
                const fileName = `Quran_${getSurahName(currentAyah.s)}_${start}${start !== end ? '-' + end : ''}.mp3`;

                try {
                    // Helper to strip ID3v2, ID3v1 tags, and neutralize Xing/Info headers
                    const cleanAudioBuffer = (buffer: ArrayBuffer) => {
                        let uint8 = new Uint8Array(buffer);
                        let startOffset = 0;
                        let endOffset = uint8.length;

                        // Strip ID3v2 (at the beginning)
                        if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) { // "ID3"
                            const size = (uint8[6] << 21) | (uint8[7] << 14) | (uint8[8] << 7) | uint8[9];
                            startOffset = size + 10;
                        }

                        // Strip ID3v1 (at the end - 128 bytes starting with "TAG")
                        if (uint8.length > 128) {
                            const tagOffset = uint8.length - 128;
                            if (uint8[tagOffset] === 0x54 && uint8[tagOffset + 1] === 0x41 && uint8[tagOffset + 2] === 0x47) { // "TAG"
                                endOffset = tagOffset;
                            }
                        }

                        // Neutralize Xing/Info headers by overwriting them with zeros
                        // This prevents players from using the first file's duration for the concatenated file
                        const searchLimit = Math.min(startOffset + 1000, endOffset);
                        for (let i = startOffset; i < searchLimit - 4; i++) {
                            if (
                                (uint8[i] === 0x58 && uint8[i+1] === 0x69 && uint8[i+2] === 0x6E && uint8[i+3] === 0x67) || // Xing
                                (uint8[i] === 0x49 && uint8[i+1] === 0x6E && uint8[i+2] === 0x66 && uint8[i+3] === 0x6F)    // Info
                            ) {
                                uint8[i] = 0;
                                uint8[i+1] = 0;
                                uint8[i+2] = 0;
                                uint8[i+3] = 0;
                                break;
                            }
                        }

                        if (startOffset >= endOffset) return buffer;
                        return buffer.slice(startOffset, endOffset);
                    };

                    // Fetch ayahs sequentially to prevent memory/network crash
                    const buffers: ArrayBuffer[] = [];
                    
                    if (Capacitor.isNativePlatform()) {
                        let isFirst = true;
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            const audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            
                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            const cleanedBuffer = cleanAudioBuffer(buffer);
                            
                            const base64Data = await blobToBase64(new Blob([cleanedBuffer]));
                            const dataToWrite = base64Data.split(',')[1];
                            
                            if (isFirst) {
                                await Filesystem.writeFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                                isFirst = false;
                            } else {
                                await Filesystem.appendFile({
                                    path: fileName,
                                    data: dataToWrite,
                                    directory: Directory.Cache,
                                });
                            }
                        }
                        
                        const savedFile = await Filesystem.getUri({
                            path: fileName,
                            directory: Directory.Cache,
                        });
                        
                        await Share.share({
                            title: 'مشاركة تلاوة',
                            text: shareText,
                            url: savedFile.uri,
                            dialogTitle: 'مشاركة عبر'
                        });
                    } else {
                        // Web fallback
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            const audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            
                            const res = await fetch(audioUrl);
                            if (!res.ok) throw new Error(`Failed to fetch audio for ayah ${ay.a}`);
                            const buffer = await res.arrayBuffer();
                            buffers.push(cleanAudioBuffer(buffer));
                        }
                        
                        const combinedBlob = new Blob(buffers, { type: 'audio/mpeg' });
                        const file = new File([combinedBlob], fileName, { type: 'audio/mpeg' });
                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                title: 'مشاركة تلاوة',
                                text: shareText,
                                files: [file],
                            });
                        } else {
                            const link = document.createElement('a');
                            link.download = fileName;
                            link.href = URL.createObjectURL(combinedBlob);
                            link.click();
                        }
                    }
                } catch (e) {
                    console.error('Error sharing audio file:', e);
                    showToast?.("حدث خطأ أثناء تحميل الملفات الصوتية");
                }
            }
        } catch (error) {
            console.error('Error sharing:', error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleCopy = async () => {
        if (isCopying) return;
        setIsCopying(true);
        const shareText = `${surahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        const fullText = `${combinedText}\n\n${combinedExplanation ? combinedExplanation + '\n\n' : ''}${shareText}`;
        
        try {
            await navigator.clipboard.writeText(fullText);
            setShowCopySuccess(true);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast?.("فشل نسخ النص");
        } finally {
            setIsCopying(false);
        }
    };

    const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const pageAyahs: any[] = [];
    let pageSurahInfo = "";
    
    // Always calculate pageAyahs for capture
    quranData.surahs.forEach((surah: any, sIdx: number) => {
        surah.ayahs.forEach((ayah: any) => {
            if (ayah.page === pageNum) {
                pageAyahs.push({ 
                    ...ayah,
                    sNum: sIdx + 1, 
                    numberInSurah: ayah.numberInSurah, 
                    sName: surah.name, 
                    juz: ayah.juz, 
                    hizbQuarter: ayah.hizbQuarter 
                });
            }
        });
    });
    
    if (pageAyahs.length > 0) {
        const firstPageAyah = pageAyahs[0];
        const lastPageAyah = pageAyahs[pageAyahs.length - 1];
        pageSurahInfo = firstPageAyah.sNum === lastPageAyah.sNum 
            ? `سورة ${getSurahName(firstPageAyah.sNum)} - آية ${toArabic(firstPageAyah.numberInSurah)} إلى آية ${toArabic(lastPageAyah.numberInSurah)}`
            : `سورة ${getSurahName(firstPageAyah.sNum)} آية ${toArabic(firstPageAyah.numberInSurah)} - سورة ${getSurahName(lastPageAyah.sNum)} آية ${toArabic(lastPageAyah.numberInSurah)}`;
    }

    const renderShareHeader = () => {
        if (pageAyahs.length === 0) return null;
        const firstAyah = pageAyahs[0];
        const surahNum = firstAyah.sNum;
        const surahName = SURAH_NAMES_AR[surahNum - 1];
        const surahInfo = SURAH_INFO[surahNum];

        return (
            <div style={{ width: '100%', marginBottom: '20px' }}>
                <SurahHeader 
                    surahNumber={surahNum}
                    surahName={surahName}
                    surahType={surahInfo?.type}
                    ayahCount={surahInfo?.ayahs || 0}
                    currentTheme={currentTheme}
                    design={propSettings?.surahHeaderDesign || 1}
                />
            </div>
        );
    };

    return (
        <div className="fixed z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0 }} dir="rtl" onClick={onClose}>
            {/* Hidden capture element for High Quality Image Share */}
            <div 
                id="hidden-image-capture"
                ref={hiddenImageCaptureRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1280px',
                    minHeight: '720px',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    textAlign: 'center',
                    background: selectedBg.value,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: `10px solid ${selectedBg.border}`,
                    direction: 'rtl'
                }}
            >
                {selectedBg.id !== 'bg_white' && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                )}
                <FrameOverlay frame={selectedFrame} scale={4} />
                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%' }}>
                    {readingMode === 'mushaf' && (
                        <p 
                            style={{ 
                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                fontSize: `${fontSize * 1.2 * 4}px`, 
                                color: selectedBg.accent, 
                                marginBottom: '50px',
                                textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 6px 12px rgba(0,0,0,0.5)',
                                opacity: 1,
                                marginTop: '20px',
                                fontWeight: 'bold'
                            }}
                        >
                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                        </p>
                    )}
                    <p 
                        className="share-preview-text"
                        style={{ 
                            lineHeight: '1.8',
                            fontFamily: selectedFont,
                            fontSize: `${fontSize * 1.15 * 4}px`, 
                            color: textColor,
                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 6px 12px rgba(0,0,0,0.5)',
                            margin: 0,
                            marginTop: '20px',
                            fontWeight: 'bold',
                            whiteSpace: 'normal',
                            letterSpacing: 0,
                            wordBreak: 'keep-all',
                            fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                            textRendering: 'optimizeLegibility'
                        }}
                    >
                        {selectedAyahs.map((ay, idx) => (
                            <React.Fragment key={idx}>
                                <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                {` ﴿${toArabic(ay.a)}﴾ `}
                            </React.Fragment>
                        ))}
                    </p>
                    {combinedExplanation && (
                        <p style={{
                            fontFamily: 'var(--font-cairo), sans-serif',
                            fontSize: `${fontSize * 0.8 * 4}px`,
                            color: textColor,
                            opacity: 0.9,
                            marginTop: '40px',
                            textAlign: 'center',
                            lineHeight: '1.6',
                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 3px 6px rgba(0,0,0,0.5)',
                            maxWidth: '90%'
                        }}>
                            {combinedExplanation}
                        </p>
                    )}
                    <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '3px solid rgba(255, 255, 255, 0.3)', width: '100%', paddingLeft: '15px', paddingRight: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: `${fontSize * 2}px`, fontWeight: 'bold', opacity: 0.9, textAlign: 'center', margin: 0 }}>
                            {surahInfo}
                        </p>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10px' }}>
                            <span 
                                style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.accent, textShadow: '0 3px 9px rgba(0,0,0,0.8)', fontSize: `${fontSize * 2.4}px`, fontWeight: 700, textAlign: 'right' }} 
                                dir="rtl"
                            >
                                مصحف احمد وليلى
                            </span>
                            <span 
                                style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: `${fontSize * 1.7}px`, fontWeight: 500, maxWidth: '50%', textAlign: 'left', lineHeight: 1.2, opacity: 0.9 }} 
                            >
                                {customText}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hidden Mushaf capture element for high-quality page share */}
            <div 
                id="hidden-mushaf-capture"
                ref={hiddenMushafRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1080px', // Fixed width for high-quality capture
                    backgroundColor: '#ffffff',
                    padding: '60px 50px',
                    color: '#000000',
                    direction: 'rtl'
                }}
            >
                <style>{`
                    #hidden-mushaf-capture .surah-header-container {
                        display: none !important;
                    }
                    #hidden-mushaf-capture .ayah-text-block {
                        font-size: 42px !important;
                        line-height: 2.2 !important;
                    }
                `}</style>
                {renderShareHeader()}
                <MushafPage 
                    pageNum={pageNum}
                    pageData={pageAyahs}
                    highlightedAyahId={null}
                    onAyahClick={() => {}}
                    onVerseClick={() => {}}
                    settings={appSettings || { fontSize: 2.5, fontFamily: 'var(--font-amiri-quran)', textColor: '#000000' }}
                    useTajweed={false}
                />
                    <div style={{ 
                        marginTop: '30px', 
                        paddingTop: '20px', 
                        borderTop: '3px solid #3b82f6', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-lateef), serif', fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}>مصحف احمد وليلى</span>
                            <span style={{ fontSize: '16px', opacity: 0.7, fontWeight: 'bold' }}>صفحة {toArabic(pageNum)}</span>
                        </div>
                        {pageAyahs.length > 0 && pageAyahs[0].sNum === pageAyahs[pageAyahs.length - 1].sNum && (
                            <p style={{ fontSize: '18px', color: '#666', margin: 0, fontWeight: 'bold' }}>
                                {getSurahMetadata(pageAyahs[0].sNum)}
                            </p>
                        )}
                    </div>
            </div>

            {/* Hidden capture element for Tafseer/Meanings page share */}
            {readingMode !== 'mushaf' && (
                <div 
                    id="hidden-page-capture"
                    ref={hiddenCaptureRef}
                    style={{
                        position: 'absolute',
                        left: '-9999px',
                        top: '-9999px',
                        width: '1080px', // Same as Mushaf
                        backgroundColor: '#ffffff',
                        padding: '60px 50px', // Same as Mushaf
                        color: '#000000',
                        direction: 'rtl'
                    }}
                >
                    {renderShareHeader()}
                    
                    <div style={{ padding: '15px 8px 5px' }}>
                        {pageAyahs.map((ay, idx) => {
                            const ayahText = getAyahText(ay.sNum, ay.numberInSurah);
                            const explanation = getExplanationText(ay.sNum, ay.numberInSurah);
                            const isNewSurah = idx === 0 || pageAyahs[idx-1].sNum !== ay.sNum;
                            
                            return (
                                <div key={`${ay.sNum}-${ay.numberInSurah}`} style={{ marginBottom: '30px' }}>
                                    {isNewSurah && idx > 0 && (
                                        <div style={{ textAlign: 'center', margin: '40px 0', padding: '15px', backgroundColor: `rgba(22, 163, 74, 0.1)`, borderRadius: '12px' }}>
                                            <h3 style={{ fontSize: '36px', fontWeight: 'bold', color: '#16a34a' }}>سورة {getSurahName(ay.sNum)}</h3>
                                        </div>
                                    )}
                                    <div style={{ 
                                        fontSize: '42px', 
                                        lineHeight: '2.2', 
                                        fontFamily: 'var(--font-amiri-quran), serif',
                                        color: '#000000',
                                        marginBottom: explanation ? '15px' : '0',
                                        textAlign: 'justify',
                                        textAlignLast: 'right'
                                    }}>
                                        {ayahText} <span style={{ color: '#9333ea', fontFamily: 'var(--font-hafs), serif', margin: '0 4px' }}>﴿{toArabic(ay.numberInSurah)}﴾</span>
                                    </div>
                                    {explanation && (
                                        <div style={{
                                            fontSize: '28px',
                                            lineHeight: '1.8',
                                            fontFamily: 'var(--font-default), sans-serif',
                                            color: '#333333',
                                            textAlign: 'justify',
                                            textAlignLast: 'right',
                                            backgroundColor: '#f8fafc',
                                            padding: '20px 25px',
                                            borderRadius: '12px',
                                            borderRight: '6px solid #3b82f6'
                                        }}>
                                            {explanation}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        
                        {/* Replicate MushafPage footer */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '30px', paddingBottom: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <span style={{ color: '#9333ea', fontFamily: 'var(--font-hafs), serif', fontSize: '1.6rem', margin: '0 2px' }}>﴿</span>
                                <span style={{ color: '#9333ea', fontWeight: 'bold', fontSize: '1.3rem', fontFamily: 'var(--font-default)', margin: '0 2px' }}>{toArabic(pageNum)}</span>
                                <span style={{ color: '#9333ea', fontFamily: 'var(--font-hafs), serif', fontSize: '1.6rem', margin: '0 2px' }}>﴾</span>
                            </div>
                            <div style={{ width: '60%', height: '2.5px', backgroundColor: '#9333ea', marginTop: '12px', opacity: 0.8, borderRadius: '2px' }}></div>
                        </div>
                    </div>
                    
                    <div style={{ 
                        marginTop: '30px', 
                        paddingTop: '20px', 
                        borderTop: '3px solid #3b82f6', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-lateef), serif', fontSize: '24px', color: '#3b82f6', fontWeight: 'bold' }}>مصحف احمد وليلى</span>
                            <span style={{ fontSize: '16px', opacity: 0.7, fontWeight: 'bold' }}>صفحة {toArabic(pageNum)}</span>
                        </div>
                        {pageAyahs.length > 0 && pageAyahs[0].sNum === pageAyahs[pageAyahs.length - 1].sNum && (
                            <p style={{ fontSize: '18px', color: '#666', margin: 0, fontWeight: 'bold' }}>
                                {getSurahMetadata(pageAyahs[0].sNum)}
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="w-full h-full flex items-center justify-center p-2" onClick={e => e.stopPropagation()}>
                <div className="modal-skinned rounded-2xl shadow-2xl w-full max-w-lg flex flex-col h-full overflow-hidden" style={{ color: currentTheme.textColor || '#000000' }}>
                    
                    {/* Sticky Header Section */}
                    <div className="p-3 pb-2 border-b border-gray-100 shrink-0 z-10 bg-white rounded-t-2xl">
                        {/* Share Type Selector */}
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            <button onClick={() => setShareType('text')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'text' ? 'text-white shadow' : 'text-gray-600'}`} style={{ backgroundColor: shareType === 'text' ? (currentTheme.accent || '#3b82f6') : 'transparent' }}>
                                <Type size={14} /> نص
                            </button>
                            <button onClick={() => setShareType('image')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'image' ? 'text-white shadow' : 'text-gray-600'}`} style={{ backgroundColor: shareType === 'image' ? (currentTheme.accent || '#3b82f6') : 'transparent' }}>
                                <ImageIcon size={14} /> صورة
                            </button>
                            <button onClick={() => setShareType('page')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'page' ? 'text-white shadow' : 'text-gray-600'}`} style={{ backgroundColor: shareType === 'page' ? (currentTheme.accent || '#3b82f6') : 'transparent' }}>
                                <FileText size={14} /> صفحة
                            </button>
                            <button onClick={() => setShareType('audio')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors ${shareType === 'audio' ? 'text-white shadow' : 'text-gray-600'}`} style={{ backgroundColor: shareType === 'audio' ? (currentTheme.accent || '#3b82f6') : 'transparent' }}>
                                <Volume2 size={14} /> صوت
                            </button>
                        </div>

                        {/* Range Selector */}
                        <div className={`flex justify-between items-center bg-gray-50 p-1.5 rounded-xl gap-3 mt-3 transition-opacity ${shareType === 'page' ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div className="flex-1">
                                <label className="block text-[9px] text-center text-gray-500 mb-0.5">من</label>
                                <select 
                                    value={fromAyah} 
                                    onChange={(e) => setFromAyah(Number(e.target.value))}
                                    className="w-full p-1 text-[10px] border rounded-lg bg-white text-center outline-none"
                                >
                                    {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => (
                                        <option key={ay.numberInSurah} value={ay.numberInSurah}>
                                            {getSurahName(currentAyah.s)} {ay.numberInSurah}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[9px] text-center text-gray-500 mb-0.5">إلى</label>
                                <select 
                                    value={toAyah} 
                                    onChange={(e) => setToAyah(Number(e.target.value))}
                                    className="w-full p-1 text-[10px] border rounded-lg bg-white text-center outline-none"
                                >
                                    {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => (
                                        <option key={ay.numberInSurah} value={ay.numberInSurah}>
                                            {getSurahName(currentAyah.s)} {ay.numberInSurah}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-3 space-y-4 overflow-y-auto flex-1">
                        {/* Preview Area (Always rendered, disabled if not image) */}
                        <div className={`flex justify-center drop-shadow-md transition-opacity ${shareType !== 'image' ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
                            <div 
                                ref={previewRef}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: '320px',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    textAlign: 'center',
                                    background: selectedBg.value,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    border: `3px solid ${selectedBg.border}`
                                }}
                            >
                                {selectedBg.id !== 'bg_white' && (
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.2)' }}></div>
                                )}
                                
                                {shareType === 'page' && (
                                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-[30] rounded-xl border-2 border-emerald-500 animate-fadeIn">
                                        <FileText size={48} className="text-emerald-600 mb-3" />
                                        <span className="font-bold text-emerald-800 text-lg">مشاركة الصفحة كاملة</span>
                                        <span className="text-sm text-gray-500 mt-2 px-4 text-center">سيتم تصدير الصفحة {toArabic(pageNum)} بجودة فائقة الدقة (4K)</span>
                                    </div>
                                )}

                                {shareType === 'audio' && (
                                    <div className="absolute inset-0 bg-blue-50/95 flex flex-col items-center justify-center z-[30] rounded-xl border-2 border-blue-500 animate-fadeIn">
                                        <Volume2 size={48} className="text-blue-600 mb-3" />
                                        <span className="font-bold text-blue-800 text-lg">مشاركة تلاوة صوتية</span>
                                        <span className="text-sm text-gray-500 mt-2 px-4 text-center">سيتم دمج تلاوة الآيات المختارة في ملف MP3 واحد</span>
                                    </div>
                                )}

                                {shareType === 'text' && (
                                    <div className="absolute inset-0 bg-gray-50/95 flex flex-col items-center justify-center z-[30] rounded-xl border-2 border-gray-400 animate-fadeIn">
                                        <Type size={48} className="text-gray-600 mb-3" />
                                        <span className="font-bold text-gray-800 text-lg">مشاركة النص فقط</span>
                                        <span className="text-sm text-gray-500 mt-2 px-4 text-center">سيتم نسخ نص الآيات مع التفسير المختار للمشاركة</span>
                                    </div>
                                )}

                                <FrameOverlay frame={selectedFrame} />
                                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyItems: 'center', width: '100%' }}>
                                    {readingMode === 'mushaf' && (
                                        <p 
                                            style={{ 
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                                fontSize: `${fontSize * 1.2}px`, 
                                                color: selectedBg.accent, 
                                                marginBottom: '16px',
                                                textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                                opacity: 1,
                                                marginTop: '8px',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </p>
                                    )}
                                    <p 
                                        className="share-preview-text"
                                        style={{ 
                                            lineHeight: '1.8',
                                            fontFamily: selectedFont,
                                            fontSize: `${fontSize * 1.15}px`, 
                                            color: textColor,
                                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                            margin: 0,
                                            marginTop: '8px',
                                            fontWeight: 'bold',
                                            whiteSpace: 'normal',
                                            letterSpacing: 0,
                                            wordBreak: 'keep-all',
                                            fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                            textRendering: 'optimizeLegibility'
                                        }}
                                    >
                                        {selectedAyahs.map((ay, idx) => (
                                            <React.Fragment key={idx}>
                                                <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                                {` ﴿${toArabic(ay.a)}﴾ `}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    {combinedExplanation && (
                                        <p style={{
                                            fontFamily: 'var(--font-cairo), sans-serif',
                                            fontSize: `${fontSize * 0.8}px`,
                                            color: textColor,
                                            opacity: 0.9,
                                            marginTop: '12px',
                                            textAlign: 'center',
                                            lineHeight: '1.6',
                                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                            maxWidth: '90%'
                                        }}>
                                            {combinedExplanation}
                                        </p>
                                    )}
                                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.3)', width: '100%', paddingLeft: '4px', paddingRight: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                        <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 'bold', opacity: 0.9, textAlign: 'center', margin: 0 }}>
                                            {surahInfo}
                                        </p>
                                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '2px' }}>
                                            <span 
                                                style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.accent, textShadow: '0 1px 3px rgba(0,0,0,0.8)', fontSize: '14px', fontWeight: 700, textAlign: 'right' }} 
                                                dir="rtl"
                                            >
                                                مصحف احمد وليلى
                                            </span>
                                            <span 
                                                style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '10px', fontWeight: 500, maxWidth: '50%', textAlign: 'left', lineHeight: 1.2, opacity: 0.9 }} 
                                            >
                                                {customText}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Image Customization Controls (Always rendered, disabled if not image) */}
                        <div className={`space-y-2 transition-opacity ${shareType !== 'image' ? 'opacity-40 pointer-events-none' : ''}`}>
                            {/* Background Selection */}
                            <div>
                                <label className="block text-[10px] font-medium text-gray-700 mb-1">الخلفية</label>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {BACKGROUNDS.map(bg => (
                                        <button
                                            key={bg.id}
                                            onClick={() => setSelectedBg(bg)}
                                            className={`w-8 h-8 rounded-lg shrink-0 border-2 transition-all ${selectedBg.id === bg.id ? 'scale-110 shadow-sm' : 'border-transparent'}`}
                                            style={{
                                                background: bg.value,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderColor: selectedBg.id === bg.id ? (currentTheme.accent || '#3b82f6') : 'transparent'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Frame Selection */}
                            <div>
                                <label className="block text-[10px] font-medium text-gray-700 mb-1">الإطار</label>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {FRAMES.map(frame => (
                                        <button
                                            key={frame.id}
                                            onClick={() => setSelectedFrame(frame)}
                                            className={`shrink-0 px-2 py-1 rounded-lg border transition-all text-[9px] font-medium flex items-center justify-center min-w-[60px] ${selectedFrame.id === frame.id ? 'bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 bg-white text-gray-700'}`}
                                            style={selectedFrame.id === frame.id ? { borderColor: currentTheme.accent || '#3b82f6', color: currentTheme.accent || '#1d4ed8' } : {}}
                                        >
                                            {frame.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Controls */}
                            <div className="grid grid-cols-2 gap-2">
                                {/* Font Size */}
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-700 mb-1">حجم الخط</label>
                                    <div className="flex items-center justify-between bg-gray-50 p-1 rounded-lg">
                                        <button 
                                            onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                                            className="p-1 hover:bg-white rounded-md text-gray-600"
                                        >
                                            <Minus size={12} />
                                        </button>
                                        <span className="font-medium text-[10px] text-gray-700">{fontSize}</span>
                                        <button 
                                            onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                                            className="p-1 hover:bg-white rounded-md text-gray-600"
                                        >
                                            <Plus size={12} />
                                        </button>
                                    </div>
                                </div>

                                {/* Text Color */}
                                <div>
                                    <label className="block text-[10px] font-medium text-gray-700 mb-1">لون النص</label>
                                    <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar bg-gray-50 p-1 rounded-lg items-center">
                                        {TEXT_COLORS.map(color => (
                                            <button
                                                key={color}
                                                onClick={() => setTextColor(color)}
                                                className={`w-5 h-5 rounded-full shrink-0 border-2 transition-all ${textColor === color ? 'scale-110' : 'border-gray-300'}`}
                                                style={{ backgroundColor: color, borderColor: textColor === color ? (currentTheme.accent || '#3b82f6') : '#d1d5db' }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Font Selection */}
                            <div>
                                <label className="block text-[10px] font-medium text-gray-700 mb-1">نوع الخط</label>
                                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                    {FONTS.map(font => (
                                        <button
                                            key={font.id}
                                            onClick={() => setSelectedFont(font.id)}
                                            className={`px-2 py-1 rounded-lg shrink-0 border transition-all text-[10px] ${selectedFont === font.id ? 'text-white' : 'bg-gray-50 text-gray-700 border-gray-300'}`}
                                            style={{ 
                                                fontFamily: font.id,
                                                backgroundColor: selectedFont === font.id ? (currentTheme.accent || '#3b82f6') : 'transparent',
                                                borderColor: selectedFont === font.id ? (currentTheme.accent || '#3b82f6') : '#d1d5db'
                                            }}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Text Input */}
                            <div>
                                <input 
                                    type="text" 
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="نص إضافي (اختياري)..."
                                    className="w-full p-1.5 text-[10px] border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:border-transparent outline-none transition-all"
                                    style={{ focusRingColor: currentTheme.accent || '#3b82f6' } as any}
                                    maxLength={50}
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t bg-gray-50 flex gap-2">
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-200 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                        >
                            رجوع
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={isCopying}
                            className="flex-1 py-4 rounded-xl text-xs font-bold text-gray-700 bg-white border border-gray-300 flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                        >
                            {isCopying ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <i className="fa-regular fa-copy"></i>
                                    نسخ
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleShare}
                            disabled={isSharing}
                            className="flex-1 py-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
                            style={{ backgroundColor: currentTheme.accent || '#3b82f6' }}
                        >
                            {isSharing ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <Share2 size={16} />
                                    مشاركة
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {showCopySuccess && (
                <div className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center px-4 animate-fadeIn" onClick={() => setShowCopySuccess(false)}>
                    <div className="modal-skinned w-full max-w-xs rounded-2xl overflow-hidden shadow-2xl animate-scaleIn" onClick={e => e.stopPropagation()}>
                        <div className="p-4 flex flex-col items-center text-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <i className="fa-solid fa-check text-3xl"></i>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">تم النسخ!</h3>
                                <p className="text-sm text-gray-600">تم نسخ نص الآيات بنجاح إلى الحافظة</p>
                            </div>
                            <button 
                                onClick={() => setShowCopySuccess(false)}
                                className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-md"
                                style={{ backgroundColor: currentTheme.accent || '#16a34a' }}
                            >
                                موافق
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareAyahModal;
