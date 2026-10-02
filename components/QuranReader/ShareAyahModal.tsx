import React, { useState, useRef, useEffect } from 'react';
import { X, Share2, Plus, Minus, Type, Image as ImageIcon, FileText, Volume2, Palette, LayoutTemplate, Check } from 'lucide-react';
import html2canvas from 'html2canvas';
import { safeHtml2Canvas } from '../../utils/canvasHelper';
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
    isLandscape?: boolean;
}

const BACKGROUNDS = [
    { id: 'bg_white', type: 'solid', value: '#ffffff', border: '#e2e8f0', accent: '#0f172a' },
    { id: 'bg_black', type: 'solid', value: '#0f172a', border: '#334155', accent: '#fbbf24' },
    { id: 'bg_emerald_gold', type: 'gradient', value: 'linear-gradient(to bottom right, #064e3b, #0f766e)', border: '#34d399', accent: '#fbbf24' },
    { id: 'bg_midnight_gold', type: 'gradient', value: 'linear-gradient(to bottom, #1e1b4b, #312e81)', border: '#818cf8', accent: '#fbbf24' },
    { id: 'bg_royal', type: 'gradient', value: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)', border: '#c084fc', accent: '#fde047' },
    { id: 'bg_maroon', type: 'gradient', value: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', border: '#fca5a5', accent: '#fef08a' },
    { id: 'bg_ocean', type: 'gradient', value: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', border: '#38bdf8', accent: '#f0f9ff' },
    { id: 'bg_forest', type: 'gradient', value: 'radial-gradient(circle at top right, #14532d, #064e3b)', border: '#6ee7b7', accent: '#fde047' },
    { id: 'bg_sand', type: 'gradient', value: 'linear-gradient(to right, #fef3c7, #fde68a)', border: '#d97706', accent: '#78350f' },
    { id: 'bg_sage', type: 'gradient', value: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)', border: '#059669', accent: '#064e3b' },
    { id: 'bg_mesh_1', type: 'gradient', value: 'radial-gradient(at 0% 0%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 100%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #0f766e, #312e81)', border: '#10b981', accent: '#fbbf24' },
    { id: 'bg_mesh_2', type: 'gradient', value: 'radial-gradient(at 100% 0%, #7c2d12 0px, transparent 50%), radial-gradient(at 0% 100%, #4c1d95 0px, transparent 50%), linear-gradient(to right, #9a3412, #6b21a8)', border: '#fb923c', accent: '#fde047' },
    { id: 'bg_mesh_3', type: 'gradient', value: 'radial-gradient(at 0% 100%, #831843 0px, transparent 50%), radial-gradient(at 100% 0%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #be185d, #4c1d95)', border: '#f472b6', accent: '#fbcfe8' },
    { id: 'bg_pattern_1', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f172a, #0f172a 10px, #1e293b 10px, #1e293b 20px)', border: '#64748b', accent: '#fbbf24' },
    { id: 'bg_pattern_2', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #064e3b 15px), repeating-linear-gradient(#022c22, #022c22)', border: '#10b981', accent: '#fef08a' }
];

const FRAMES = [
    { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent' },
    { id: 'f1', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700' },
    { id: 'f2', name: 'مزدوج أبيض', type: 'double', color: '#ffffff' },
    { id: 'f_ornate_1', name: 'أنيق ذهبي', type: 'elegant', color: '#FFD700' },
    { id: 'f_ornate_2', name: 'أنيق أبيض', type: 'elegant', color: '#ffffff' },
    { id: 'f3', name: 'زوايا ذهبي', type: 'corner-diamonds', color: '#FFD700' },
    { id: 'f4', name: 'زوايا أبيض', type: 'corner-diamonds', color: '#ffffff' },
    { id: 'f5', name: 'محراب ذهبي', type: 'mihrab', color: '#FFD700' },
    { id: 'f6', name: 'محراب أبيض', type: 'mihrab', color: '#ffffff' },
    { id: 'f7', name: 'محراب دبل ذهبي', type: 'mihrab-double', color: '#FFD700' },
    { id: 'f8', name: 'محراب دبل أبيض', type: 'mihrab-double', color: '#ffffff' },
    { id: 'f9', name: 'كلاسيكي ذهبي', type: 'classic-islamic', color: '#FFD700' },
    { id: 'f10', name: 'كلاسيكي أبيض', type: 'classic-islamic', color: '#ffffff' },
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
    if (frame.type === 'mihrab-double') {
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, border: `${2 * scale}px solid ${color}`, borderTopLeftRadius: `${60 * scale}px`, borderTopRightRadius: `${60 * scale}px`, borderBottomLeftRadius: `${8 * scale}px`, borderBottomRightRadius: `${8 * scale}px`, pointerEvents: 'none', zIndex: 5 }}>
                <div style={{ position: 'absolute', top: `${4 * scale}px`, left: `${4 * scale}px`, right: `${4 * scale}px`, bottom: `${4 * scale}px`, border: `${1 * scale}px dashed ${color}`, borderTopLeftRadius: `${56 * scale}px`, borderTopRightRadius: `${56 * scale}px`, borderBottomLeftRadius: `${4 * scale}px`, borderBottomRightRadius: `${4 * scale}px`, opacity: 0.6 }} />
            </div>
        );
    }
    if (frame.type === 'classic-islamic') {
        const cSize = 25 * scale;
        return (
            <div style={{ position: 'absolute', top: `${padding}px`, left: `${padding}px`, right: `${padding}px`, bottom: `${padding}px`, pointerEvents: 'none', zIndex: 5, border: `${1 * scale}px solid ${color}`}}>
                <div style={{ position: 'absolute', top: `${3 * scale}px`, left: `${3 * scale}px`, right: `${3 * scale}px`, bottom: `${3 * scale}px`, border: `${2 * scale}px solid ${color}`, opacity: 0.9 }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', top: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderBottom: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderBottomLeftRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${cSize}px`, height: `${cSize}px`, borderRight: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopRightRadius: '100%', opacity: 0.9 }} />
                    <div style={{ position: 'absolute', bottom: 0, right: 0, width: `${cSize}px`, height: `${cSize}px`, borderLeft: `${2 * scale}px solid ${color}`, borderTop: `${2 * scale}px solid ${color}`, backgroundColor: 'transparent', borderTopLeftRadius: '100%', opacity: 0.9 }} />
                </div>
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
    const [activeDesignTab, setActiveDesignTab] = useState<'bg' | 'frame' | 'text' | 'font' | null>(null);
    const [rangeSelectorOpen, setRangeSelectorOpen] = useState<'from' | 'to' | null>(null);
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
        
        const activeMode: any = readingMode;

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

    // Calculate page data once for both handleShare and JSX
    const pageNum = quranData?.surahs?.[currentAyah.s - 1]?.ayahs?.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
    const pageAyahs: any[] = [];
    
    if (quranData) {
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
    }

    const handleShare = async () => {
        if (isSharing) return;
        setIsSharing(true);
        
        let shareText = `${surahInfo}\nايات من القران الكريم . بواسطة : مصحف احمد وليلى`;
        
        if (shareType === 'page') {
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.sNum === lastPageAyah.sNum 
                    ? `سورة ${getSurahName(firstPageAyah.sNum)} - آية ${toArabic(firstPageAyah.numberInSurah)} إلى آية ${toArabic(lastPageAyah.numberInSurah)}`
                    : `سورة ${getSurahName(firstPageAyah.sNum)} آية ${toArabic(firstPageAyah.numberInSurah)} - سورة ${getSurahName(lastPageAyah.sNum)} آية ${toArabic(lastPageAyah.numberInSurah)}`;
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
                    }).catch(e => {
                        if (e.name !== 'AbortError') throw e;
                    });
                } else {
                    showToast?.("المشاركة غير مدعومة في هذا المتصفح");
                }
            } else if (shareType === 'image' && hiddenImageCaptureRef.current) {
                try {
                    setIsSharing(true);
                    const captureElement = hiddenImageCaptureRef.current;
                    const originalStyle = captureElement.style.cssText;
                    
                    // Force rendering for capture - using absolute and far off-screen
                    captureElement.style.position = 'absolute';
                    captureElement.style.left = '-9999px';
                    captureElement.style.top = '-9999px';
                    captureElement.style.visibility = 'visible';
                    captureElement.style.display = 'flex';
                    captureElement.style.zIndex = '-1000';

                    // Wait for fonts
                    await document.fonts.ready;
                    // Smaller delay for faster response
                    await new Promise(r => setTimeout(r, 100));

                    const canvas = await safeHtml2Canvas(captureElement, {
                        scale: 2, // 2x is high quality (2560px width) and safe for mobile
                        backgroundColor: null,
                        useCORS: true,
                        logging: false,
                        imageTimeout: 15000,
                        removeContainer: true
                    });
                    
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                    
                    // Restore original style immediately
                    captureElement.style.cssText = originalStyle;

                    if (!dataUrl || dataUrl === 'data:,') {
                        throw new Error('Failed to generate image data');
                    }

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
                            const response = await fetch(dataUrl);
                            const blob = await response.blob();
                            const file = new File([blob], 'ayah.jpg', { type: 'image/jpeg' });
                            
                            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                await navigator.share({
                                    title: 'مشاركة آية',
                                    text: shareText,
                                    files: [file],
                                });
                            } else {
                                await navigator.share({ title: 'مشاركة آية', text: shareText }).catch((e) => {
                                    if (e.name !== 'AbortError') console.error('Share error:', e);
                                });
                                // Also provide download fallback since image couldn't be shared directly
                                const link = document.createElement('a');
                                link.download = `ayah_${Date.now()}.jpg`;
                                link.href = dataUrl;
                                link.click();
                            }
                        } catch (e: any) {
                            const errorMsg = e?.message || String(e);
                            if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                                console.log('Image share interaction finished');
                            } else if (errorMsg.includes('user gesture')) {
                                console.warn('User gesture lost during capture. Falling back to download.');
                                const link = document.createElement('a');
                                link.download = `ayah_${Date.now()}.jpg`;
                                link.href = dataUrl;
                                link.click();
                                showToast?.("تم حفظ الصورة (انتهت صلاحية الإيماءة)");
                            } else {
                                console.error('Inner share error:', e);
                                await navigator.share({ title: 'مشاركة آية', text: shareText }).catch(() => {});
                            }
                        }
                    } else {
                        // Fallback: download the image
                        const link = document.createElement('a');
                        link.download = `ayah_${Date.now()}.jpg`;
                        link.href = dataUrl;
                        link.click();
                        showToast?.("تم تحميل الصورة");
                    }
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Image share interaction cancelled or failed');
                    } else {
                        console.error('Error sharing image:', e);
                        showToast?.("حدث خطأ أثناء إنشاء الصورة. حاول مرة أخرى");
                    }
                }
            } else if (shareType === 'page') {
                const pageNum = quranData.surahs[currentAyah.s - 1].ayahs.find((ay: any) => ay.numberInSurah === currentAyah.a)?.page || 1;
                
                const captureElement = hiddenMushafRef.current;
                
                if (captureElement) {
                    try {
                        setIsSharing(true);
                        // Ensure the capture element is visible for capture - using absolute and far off-screen
                        const originalStyle = captureElement.style.cssText;
                        
                        captureElement.style.position = 'absolute';
                        captureElement.style.left = '-9999px';
                        captureElement.style.top = '-9999px';
                        captureElement.style.visibility = 'visible';
                        captureElement.style.display = 'flex';
                        captureElement.style.flexDirection = 'column';
                        captureElement.style.zIndex = '-1000';

                        // Wait for fonts
                        await document.fonts.ready;
                        // Smaller delay for faster response
                        await new Promise(r => setTimeout(r, 100));

                        const canvas = await html2canvas(captureElement, {
                            scale: 2, // 2x of 1000px = 2000px, very safe and high quality
                            backgroundColor: '#ffffff',
                            useCORS: true,
                            logging: false,
                            imageTimeout: 15000,
                            removeContainer: true
                        });
                        
                        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

                        // Restore original style
                        captureElement.style.cssText = originalStyle;

                        if (!dataUrl || dataUrl === 'data:,') {
                            throw new Error('Failed to generate page image data');
                        }

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
                            try {
                                const response = await fetch(dataUrl);
                                const blob = await response.blob();
                                const file = new File([blob], `page_${pageNum}.jpg`, { type: 'image/jpeg' });
                                
                                if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                    await navigator.share({
                                        title: 'مشاركة صفحة',
                                        text: shareText,
                                        files: [file],
                                    });
                                } else {
                                    await navigator.share({ title: 'مشاركة صفحة', text: shareText }).catch((e) => {
                                        if (e.name !== 'AbortError') console.error('Share error:', e);
                                    });
                                    // Download fallback
                                    const link = document.createElement('a');
                                    link.download = `page_${pageNum}.jpg`;
                                    link.href = dataUrl;
                                    link.click();
                                }
                            } catch (e: any) {
                                const errorMsg = e?.message || String(e);
                                if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                                    console.log('Page share interaction finished');
                                } else if (errorMsg.includes('user gesture')) {
                                    console.warn('User gesture lost during page capture. Falling back to download.');
                                    const link = document.createElement('a');
                                    link.download = `page_${pageNum}.jpg`;
                                    link.href = dataUrl;
                                    link.click();
                                    showToast?.("تم حفظ الصفحة (انتهت صلاحية الإيماءة)");
                                } else {
                                    console.error('Inner share error:', e);
                                    await navigator.share({ title: 'مشاركة صفحة', text: shareText }).catch(() => {});
                                }
                            }
                        } else {
                            const link = document.createElement('a');
                            link.download = `page_${pageNum}.jpg`;
                            link.href = dataUrl;
                            link.click();
                            showToast?.("تم تحميل صورة الصفحة");
                        }
                    } catch (e: any) {
                        const errorMsg = e?.message || String(e);
                        if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                            console.log('Page share interaction cancelled or failed');
                        } else {
                            console.error('Error capturing page:', e);
                            showToast?.("حدث خطأ أثناء إنشاء صورة الصفحة");
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

                // Custom file name: Use safe characters for filename
                const fileName = `quran_audio_${currentAyah.s}_${start}${start !== end ? '_' + end : ''}.mp3`;

                try {
                        // Helper to strip ID3v2, ID3v1 tags, and neutralize Xing/Info headers
                        const cleanAudioBuffer = (buffer: ArrayBuffer) => {
                            let uint8 = new Uint8Array(buffer);
                            let startOffset = 0;
                            let endOffset = uint8.length;

                            // Strip ID3v2 (at the beginning)
                            if (uint8.length > 10 && uint8[0] === 0x49 && uint8[1] === 0x44 && uint8[2] === 0x33) { // "ID3"
                                // The size is encoded as syncsafe integer
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

                            // Only slice if offsets are valid
                            if (startOffset > 0 || endOffset < uint8.length) {
                                if (startOffset >= endOffset) return buffer;
                                return buffer.slice(startOffset, endOffset);
                            }
                            return buffer;
                        };

                    // Fetch ayahs sequentially to prevent memory/network crash
                    const buffers: ArrayBuffer[] = [];
                    
                    if (Capacitor.isNativePlatform()) {
                        let isFirst = true;
                        for (const ay of ayahsToShare) {
                            const sStr = String(ay.s).padStart(3, '0');
                            const aStr = String(ay.a).padStart(3, '0');
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }
                            
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
                            let audioUrl = `https://everyayah.com/data/${audioReader}/${sStr}${aStr}.mp3`;
                            if (/^[a-z]{2,3}\./.test(audioReader)) {
                                const globalAyahNum = quranData?.surahs[ay.s - 1]?.ayahs[ay.a - 1]?.number;
                                if (globalAyahNum) {
                                    audioUrl = `https://cdn.islamic.network/quran/audio/128/${audioReader}/${globalAyahNum}.mp3`;
                                }
                            }
                            
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
                } catch (e: any) {
                    const errorMsg = e?.message || String(e);
                    if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                        console.log('Share canceled by user');
                    } else {
                        console.error('Error sharing audio file:', e);
                        showToast?.("حدث خطأ أثناء تحميل الملفات الصوتية");
                    }
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

    // Removed redundant calculation

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
                    width: '1000px',
                    minHeight: '600px',
                    borderRadius: '40px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px',
                    textAlign: 'center',
                    backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                    backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
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
                    <div style={{ marginTop: '60px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
                        <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: `${fontSize * 1.8}px`, fontWeight: 'bold', opacity: 0.9, textAlign: 'center', margin: 0 }}>
                            {surahInfo}
                        </p>
                        <div style={{ width: '70%', borderTop: '3px solid rgba(255, 255, 255, 0.3)' }}></div>
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                            <a 
                                href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.accent, textShadow: '0 3px 9px rgba(0,0,0,0.8)', fontSize: `${fontSize * 2.4}px`, fontWeight: 700, textAlign: 'center', textDecoration: 'none' }} 
                                dir="rtl"
                            >
                                مصحف احمد وليلى
                            </a>
                            <span 
                                style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: `${fontSize * 1.7}px`, fontWeight: 500, maxWidth: '80%', textAlign: 'center', lineHeight: 1.2, opacity: 0.9 }} 
                            >
                                {customText}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified capture element for high-quality page share (Mushaf, Tafseer, Meanings, Translation) */}
            <div 
                id="hidden-mushaf-capture"
                ref={hiddenMushafRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1000px', 
                    minHeight: 'auto',
                    height: 'auto', 
                    backgroundColor: '#ffffff',
                    padding: '80px 60px 0px',
                    color: '#000000',
                    direction: 'rtl',
                    display: 'flex',
                    flexDirection: 'column',
                    // Essential variables for MushafPage
                    ['--qr-fontFamily' as any]: appSettings?.fontFamily || 'var(--font-amiri-quran)',
                    ['--qr-text' as any]: '#000000',
                    ['--font-amiri-quran' as any]: 'var(--font-amiri-quran)',
                    ['--font-hafs' as any]: 'var(--font-hafs)'
                }}
            >
                <style>{`
                    #hidden-mushaf-capture .mushaf-page .surah-header-container-wrapper {
                        display: none !important;
                    }
                    #hidden-mushaf-capture .ayah-text-block {
                        font-size: 42px !important;
                        line-height: 2.2 !important;
                    }
                    #hidden-mushaf-capture .mushaf-page {
                        flex: 0 0 auto !important;
                    }
                `}</style>
                {renderShareHeader()}
                
                {readingMode === 'mushaf' ? (
                    <MushafPage 
                        pageNum={pageNum}
                        pageData={pageAyahs}
                        highlightedAyahId={null}
                        onAyahClick={() => {}}
                        onVerseClick={() => {}}
                        settings={appSettings || { fontSize: 2.5, fontFamily: 'var(--font-amiri-quran)', textColor: '#000000' }}
                        currentTheme={currentTheme}
                    />
                ) : (
                    <div style={{ padding: '15px 8px 5px', flex: '0 0 auto' }}>
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
                    </div>
                )}

                <div style={{ 
                    marginTop: '40px', 
                    paddingTop: '20px', 
                    paddingBottom: '30px', // Enough space for font descenders to avoid clipping
                    borderTop: '3px solid #3b82f6', 
                    display: 'flex', 
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    letterSpacing: 0,
                    wordSpacing: 0
                }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', letterSpacing: 0, wordSpacing: 0 }}>
                        <a href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-lateef), serif', fontSize: '28px', color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none', letterSpacing: 0, wordSpacing: 0, fontVariantLigatures: 'normal' }}>مصحف احمد وليلى</a>
                    </div>
                </div>
            </div>

            <div className="w-full h-full flex flex-col overflow-hidden shadow-none border-[4px]" style={{ backgroundColor: currentTheme.bg || '#ffffff', borderColor: currentTheme.accent || '#3b82f6' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header */}
                    <div className="p-3 border-b flex items-center justify-center shrink-0" style={{ backgroundColor: currentTheme.bg || '#ffffff', borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                        <h3 className="text-sm font-bold" style={{ color: currentTheme.text }}>خيارات المشاركة</h3>
                    </div>

                    {/* Sticky Header Section */}
                    <div className="p-3 pb-2 border-b shrink-0 z-10" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        {/* Share Type Selector */}
                        <div className="flex rounded-lg p-1" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                            <button onClick={() => setShareType('text')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors border-[2px] ${shareType === 'text' ? 'text-white shadow' : ''}`} style={{ backgroundColor: shareType === 'text' ? (currentTheme.accent || '#3b82f6') : 'transparent', color: shareType === 'text' ? '#fff' : currentTheme.text, borderColor: shareType === 'text' ? 'transparent' : (currentTheme.accent || '#3b82f6') }}>
                                <Type size={14} /> نص
                            </button>
                            <button onClick={() => setShareType('image')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors border-[2px] ${shareType === 'image' ? 'text-white shadow' : ''}`} style={{ backgroundColor: shareType === 'image' ? (currentTheme.accent || '#3b82f6') : 'transparent', color: shareType === 'image' ? '#fff' : currentTheme.text, borderColor: shareType === 'image' ? 'transparent' : (currentTheme.accent || '#3b82f6') }}>
                                <ImageIcon size={14} /> صورة
                            </button>
                            <button onClick={() => setShareType('page')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors border-[2px] ${shareType === 'page' ? 'text-white shadow' : ''}`} style={{ backgroundColor: shareType === 'page' ? (currentTheme.accent || '#3b82f6') : 'transparent', color: shareType === 'page' ? '#fff' : currentTheme.text, borderColor: shareType === 'page' ? 'transparent' : (currentTheme.accent || '#3b82f6') }}>
                                <FileText size={14} /> صفحة
                            </button>
                            <button onClick={() => setShareType('audio')} className={`flex-1 py-2 text-[12px] font-bold rounded-md flex items-center justify-center gap-1 transition-colors border-[2px] ${shareType === 'audio' ? 'text-white shadow' : ''}`} style={{ backgroundColor: shareType === 'audio' ? (currentTheme.accent || '#3b82f6') : 'transparent', color: shareType === 'audio' ? '#fff' : currentTheme.text, borderColor: shareType === 'audio' ? 'transparent' : (currentTheme.accent || '#3b82f6') }}>
                                <Volume2 size={14} /> صوت
                            </button>
                        </div>

                        {/* Range Selector */}
                        <div className={`flex justify-between items-center p-2 rounded-2xl gap-3 mt-3 transition-all ${shareType === 'page' ? 'opacity-50 pointer-events-none' : ''}`} style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            <div className="flex-1">
                                <label className="block text-[10px] text-center mb-1 font-bold opacity-50" style={{ color: currentTheme.text }}>من</label>
                                <button 
                                    onClick={() => setRangeSelectorOpen('from')}
                                    className="w-full py-2.5 px-3 text-[12px] border-[2px] rounded-xl text-center shadow-sm active:scale-95 transition-all font-bold"
                                    style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.accent || '#3b82f6', color: currentTheme.text }}
                                >
                                    {getSurahName(currentAyah.s)} {toArabic(fromAyah)}
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] text-center mb-1 font-bold opacity-50" style={{ color: currentTheme.text }}>إلى</label>
                                <button 
                                    onClick={() => setRangeSelectorOpen('to')}
                                    className="w-full py-2.5 px-3 text-[12px] border-[2px] rounded-xl text-center shadow-sm active:scale-95 transition-all font-bold"
                                    style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.accent || '#3b82f6', color: currentTheme.text }}
                                >
                                    {getSurahName(currentAyah.s)} {toArabic(toAyah)}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className={`p-4 overflow-y-auto flex-1 flex flex-col items-center ${shareType === 'image' ? 'justify-center' : ''}`}>
                        {/* Preview Area (Always rendered, disabled if not image) */}
                        <div className={`flex justify-center w-full drop-shadow-lg transition-all duration-300 ${shareType === 'page' ? 'opacity-40 pointer-events-none grayscale-[0.5]' : ''}`}>
                            <div 
                                ref={previewRef}
                                style={{
                                    position: 'relative',
                                    width: '100%',
                                    maxWidth: '380px',
                                    minHeight: '260px',
                                    borderRadius: '20px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    padding: '16px',
                                    textAlign: 'center',
                                    backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                                    backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
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
                                    <div className="absolute top-4 left-4 right-4 bg-blue-500/10 backdrop-blur-md border border-blue-200 py-1.5 px-3 rounded-full flex items-center justify-center gap-2 z-[30] animate-fadeIn shadow-sm">
                                        <Volume2 size={16} className="text-blue-600" />
                                        <span className="font-bold text-blue-800 text-[10px]">مشاركة تلاوة صوتية</span>
                                    </div>
                                )}

                                {shareType === 'text' && (
                                    <div className="absolute top-4 left-4 right-4 bg-gray-500/10 backdrop-blur-md border border-gray-200 py-1.5 px-3 rounded-full flex items-center justify-center gap-2 z-[30] animate-fadeIn shadow-sm">
                                        <Type size={16} className="text-gray-600" />
                                        <span className="font-bold text-gray-800 text-[10px]">مشاركة النص فقط</span>
                                    </div>
                                )}

                                <FrameOverlay frame={selectedFrame} />
                                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', flex: 1 }}>
                                    {shareType === 'image' ? (
                                        <div style={{ padding: '10px 0', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <div style={{ 
                                                fontFamily: 'var(--font-amiri-quran), serif', 
                                                fontSize: `${fontSize * 2.2}px`, 
                                                color: selectedBg.accent,
                                                fontWeight: 'bold',
                                                textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                                marginBottom: '10px'
                                            }}>
                                                سورة {getSurahName(currentAyah.s)}
                                            </div>
                                            <div style={{ 
                                                fontFamily: selectedFont, 
                                                fontSize: `${fontSize * 1.5}px`, 
                                                color: textColor,
                                                fontWeight: '500',
                                                textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)'
                                            }}>
                                                {fromAyah === toAyah ? `الآية ${toArabic(fromAyah)}` : `الآية ${toArabic(fromAyah)} إلى الآية ${toArabic(toAyah)}`}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ marginTop: shareType === 'image' ? '20px' : '10px', width: '100%', paddingLeft: '4px', paddingRight: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ width: '60%', borderTop: '2.5px solid rgba(255, 255, 255, 0.4)', margin: '8px 0' }}></div>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                                            <a 
                                                href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontFamily: 'var(--font-scheherazade), serif', color: selectedBg.accent, textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontSize: '16px', fontWeight: 800, textAlign: 'center', textDecoration: 'none' }} 
                                                dir="rtl"
                                            >
                                                مصحف احمد وليلى
                                            </a>
                                            <span 
                                                style={{ fontFamily: 'var(--font-scheherazade), serif', color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '13px', fontWeight: 600, maxWidth: '90%', textAlign: 'center', lineHeight: 1.2, opacity: 0.9 }} 
                                            >
                                                {customText}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Image Customization Controls (Moved to bottom above footer) */}
                    <div className={`px-4 pb-4 border-t transition-opacity ${shareType !== 'image' ? 'hidden' : ''}`} style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                        <div className="space-y-4 transition-opacity pb-2 mt-4">
                            {/* Tab Buttons */}
                            <div className="grid grid-cols-4 gap-2 p-1 rounded-xl w-full mx-auto shadow-sm" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'bg' ? null : 'bg')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 border-[2px] shadow-sm`}
                                    style={{ 
                                        borderColor: currentTheme.accent || '#3b82f6',
                                        backgroundColor: activeDesignTab === 'bg' ? currentTheme.bg : 'transparent',
                                        color: activeDesignTab === 'bg' ? (currentTheme.accent || '#3b82f6') : currentTheme.text,
                                        transform: activeDesignTab === 'bg' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <ImageIcon size={14} className={activeDesignTab === 'bg' ? 'opacity-100' : 'opacity-70'} />
                                    <span>الخلفية</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'frame' ? null : 'frame')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 border-[2px] shadow-sm`}
                                    style={{ 
                                        borderColor: currentTheme.accent || '#3b82f6',
                                        backgroundColor: activeDesignTab === 'frame' ? currentTheme.bg : 'transparent',
                                        color: activeDesignTab === 'frame' ? (currentTheme.accent || '#3b82f6') : currentTheme.text,
                                        transform: activeDesignTab === 'frame' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <LayoutTemplate size={14} className={activeDesignTab === 'frame' ? 'opacity-100' : 'opacity-70'} />
                                    <span>الإطار</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'text' ? null : 'text')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 border-[2px] shadow-sm`}
                                    style={{ 
                                        borderColor: currentTheme.accent || '#3b82f6',
                                        backgroundColor: activeDesignTab === 'text' ? currentTheme.bg : 'transparent',
                                        color: activeDesignTab === 'text' ? (currentTheme.accent || '#3b82f6') : currentTheme.text,
                                        transform: activeDesignTab === 'text' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <Palette size={14} className={activeDesignTab === 'text' ? 'opacity-100' : 'opacity-70'} />
                                    <span>النص</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'font' ? null : 'font')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-lg transition-all flex flex-col items-center gap-1 border-[2px] shadow-sm`}
                                    style={{ 
                                        borderColor: currentTheme.accent || '#3b82f6',
                                        backgroundColor: activeDesignTab === 'font' ? currentTheme.bg : 'transparent',
                                        color: activeDesignTab === 'font' ? (currentTheme.accent || '#3b82f6') : currentTheme.text,
                                        transform: activeDesignTab === 'font' ? 'scale(1.02)' : 'scale(1)'
                                    }}
                                >
                                    <Type size={14} className={activeDesignTab === 'font' ? 'opacity-100' : 'opacity-70'} />
                                    <span>الخط</span>
                                </button>
                            </div>

                            {/* Active Tab Content */}
                            <div className="transition-all duration-300 overflow-hidden" style={{ maxHeight: activeDesignTab ? '200px' : '0', opacity: activeDesignTab ? 1 : 0, marginTop: activeDesignTab ? '8px' : '0' }}>
                                <div className="p-3 rounded-xl border shadow-sm" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
                                    {/* Background Selection */}
                                    {activeDesignTab === 'bg' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                                                {BACKGROUNDS.map(bg => (
                                                    <button
                                                        key={bg.id}
                                                        onClick={() => setSelectedBg(bg)}
                                                        className={`w-10 h-10 rounded-xl shrink-0 border-2 transition-all ${selectedBg.id === bg.id ? 'scale-110 shadow-sm' : 'border-transparent'}`}
                                                        style={{
                                                            backgroundColor: bg.type === 'solid' ? bg.value : undefined,
                                                            backgroundImage: bg.type !== 'solid' ? bg.value : undefined,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center',
                                                            borderColor: selectedBg.id === bg.id ? (currentTheme.accent || '#3b82f6') : 'transparent'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Frame Selection */}
                                    {activeDesignTab === 'frame' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                                {FRAMES.map(frame => (
                                                    <button
                                                        key={frame.id}
                                                        onClick={() => setSelectedFrame(frame)}
                                                        className={`shrink-0 px-3 py-2 rounded-xl border-[2px] transition-all text-xs font-bold flex items-center justify-center min-w-[70px] shadow-sm`}
                                                        style={{ 
                                                            borderColor: currentTheme.accent || '#3b82f6', 
                                                            color: selectedFrame.id === frame.id ? (currentTheme.accent || '#1d4ed8') : currentTheme.text,
                                                            backgroundColor: selectedFrame.id === frame.id ? (currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent'
                                                        }}
                                                    >
                                                        {frame.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Text Controls */}
                                    {activeDesignTab === 'text' && (
                                        <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                                            <div>
                                                <label className="block text-[10px] font-bold mb-1 opacity-70">حجم الخط</label>
                                                <div className="flex items-center justify-between p-1.5 rounded-xl border-[2px] shadow-sm" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: currentTheme.accent || '#3b82f6' }}>
                                                    <button 
                                                        onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                                                        className="p-1 rounded-lg transition-all border border-transparent"
                                                        style={{ color: currentTheme.text }}
                                                    >
                                                        <Minus size={14} />
                                                    </button>
                                                    <span className="font-bold text-xs" style={{ color: currentTheme.text }}>{fontSize}</span>
                                                    <button 
                                                        onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                                                        className="p-1 rounded-lg transition-all border border-transparent"
                                                        style={{ color: currentTheme.text }}
                                                    >
                                                        <Plus size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold mb-1 opacity-70">لون النص</label>
                                                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar p-1.5 rounded-xl border items-center" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                                                    {TEXT_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setTextColor(color)}
                                                            className={`w-6 h-6 rounded-full shrink-0 border-2 transition-all shadow-sm ${textColor === color ? 'scale-110' : 'border-gray-200 opacity-80'}`}
                                                            style={{ backgroundColor: color, borderColor: textColor === color ? (currentTheme.accent || '#3b82f6') : '#e5e7eb' }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Font Selection */}
                                    {activeDesignTab === 'font' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                                                {FONTS.map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => setSelectedFont(font.id)}
                                                        className={`px-3 py-2 rounded-xl shrink-0 border-[2px] transition-all text-xs shadow-sm`}
                                                        style={{ 
                                                            fontFamily: font.id,
                                                            backgroundColor: selectedFont === font.id ? (currentTheme.accent || '#3b82f6') : 'transparent',
                                                            color: selectedFont === font.id ? '#ffffff' : currentTheme.text,
                                                            borderColor: currentTheme.accent || '#3b82f6'
                                                        }}
                                                    >
                                                        {font.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Custom Text Input */}
                            <div>
                                <input 
                                    type="text" 
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                    placeholder="نص إضافي (اختياري)..."
                                    className="w-full p-2 text-[11px] font-medium border rounded-xl outline-none transition-all shadow-inner"
                                    style={{ 
                                        backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', 
                                        color: currentTheme.text,
                                        borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                    }}
                                    maxLength={50}
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t flex gap-2" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        <button
                            onClick={onClose}
                            className="flex-1 py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 border-[2px]"
                            style={{ 
                                backgroundColor: currentTheme.btnBg || (currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff'),
                                color: currentTheme.btnText || currentTheme.text,
                                borderColor: currentTheme.accent || '#3b82f6' 
                            }}
                        >
                            رجوع
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={isCopying}
                            className="flex-1 py-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 border-[2px]"
                            style={{ 
                                backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                                color: currentTheme.text,
                                borderColor: currentTheme.accent || '#3b82f6' 
                            }}
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
                            className="flex-1 py-4 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70 border-[2px]"
                            style={{ backgroundColor: currentTheme.accent || '#3b82f6', borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }}
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
                                className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 shadow-md border-[2px]"
                                style={{ backgroundColor: currentTheme.accent || '#16a34a', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                موافق
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ayah Range Selection Overlay */}
            {rangeSelectorOpen && (
                <div 
                    className="fixed inset-0 z-[200] flex items-start justify-center pt-24" 
                    style={{ backgroundColor: 'transparent', touchAction: 'none' }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onPointerUp={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onTouchEnd={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRangeSelectorOpen(null);
                    }}
                >
                    <div 
                        className="w-[85%] max-w-[280px] flex flex-col max-h-[60vh] overflow-hidden rounded-[32px] p-2 border-[4px] shadow-2xl" 
                        style={{ backgroundColor: '#ffffff', borderColor: currentTheme.accent || '#3b82f6' }} 
                        onPointerDown={e => e.stopPropagation()}
                        onPointerUp={e => e.stopPropagation()}
                        onTouchStart={e => e.stopPropagation()}
                        onTouchEnd={e => e.stopPropagation()}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 scrollbar-hide">
                            {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => {
                                const val = ay.numberInSurah;
                                const isSelected = rangeSelectorOpen === 'from' ? fromAyah === val : toAyah === val;
                                
                                return (
                                    <button 
                                        key={ay.numberInSurah}
                                        ref={(el) => {
                                            if (el && isSelected) {
                                                // auto-scroll logic on mount
                                                // Using setTimeout to ensure DOM is ready
                                                setTimeout(() => {
                                                    el.scrollIntoView({ block: 'center' });
                                                }, 10);
                                            }
                                        }}
                                        onClick={() => {
                                            if (rangeSelectorOpen === 'from') {
                                                setFromAyah(val);
                                                setToAyah(val);
                                            }
                                            else setToAyah(val);
                                            setRangeSelectorOpen(null);
                                        }}
                                        className={`w-full py-1.5 px-2 rounded-xl border-[3px] flex flex-col items-center justify-center transition-all active:scale-[0.98] shadow-sm`}
                                        style={{ 
                                            backgroundColor: isSelected ? (currentTheme.accent || '#3b82f6') : (currentTheme.text === '#ffffff' ? '#1a1a1b' : '#ffffff'),
                                            borderColor: currentTheme.accent || '#3b82f6',
                                            color: isSelected ? '#fff' : (currentTheme.text || '#000')
                                        }}
                                    >
                                        <span className="text-base font-bold font-amiri-quran">
                                            {toArabic(val)}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShareAyahModal;
