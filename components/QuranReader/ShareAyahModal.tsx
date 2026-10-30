import React, { useState, useRef, useEffect, useMemo } from 'react';
import { X, Share2, Plus, Minus, Type, Image as ImageIcon, FileText, Volume2, Palette, LayoutTemplate, Check, ChevronRight, ChevronLeft, Images } from 'lucide-react';
import html2canvas from 'html2canvas';
import { safeHtml2Canvas } from '../../utils/canvasHelper';
import { Share } from '@capacitor/share';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import { FONTS, SURAH_NAMES_AR, toArabic, SURAH_INFO, getAyahCountText } from './constants';
import MushafPage, { renderTajweedTextHtml } from './MushafPage';
import SurahHeader from './SurahHeader';
import { useLanguage } from '../../context/LanguageContext';

const IslamicFlourish: React.FC<{ color: string; scale?: number }> = ({ color, scale = 1 }) => {
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', margin: `${10 * scale}px 0`, opacity: 0.85, pointerEvents: 'none' }}>
            <svg width={220 * scale} height={20 * scale} viewBox="0 0 220 20" fill="none">
                <path d="M10 10h65m70 0h65" stroke={color} strokeWidth={1.5 * scale} strokeLinecap="round" opacity="0.6" />
                <circle cx="82" cy="10" r={2.5 * scale} fill={color} />
                <circle cx="138" cy="10" r={2.5 * scale} fill={color} />
                <path d="M110 2l6 8-6 8-6-8z" fill={color} opacity="0.9" />
                <circle cx="110" cy="10" r={1.8 * scale} fill="#ffffff" opacity="0.75" />
            </svg>
        </div>
    );
};

interface ShareAyahModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentAyah: { s: number; a: number };
    quranData: any;
    currentTheme: any;
    readingMode?: 'mushaf' | 'tafseer' | 'meanings' | 'translation' | 'bilingual';
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
    const { language } = useLanguage();
    const isEn = language === 'en';
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
    const hiddenCapturePagesRef = useRef<(HTMLDivElement | null)[]>([]);
    const hiddenCaptureRef = useRef<HTMLDivElement>(null);
    const hiddenMushafRef = useRef<HTMLDivElement>(null);
    const selectedAyahRef = useRef<HTMLButtonElement>(null);
    const [currentImagePageIndex, setCurrentImagePageIndex] = useState(0);

    useEffect(() => {
        if (rangeSelectorOpen) {
            const timer = setTimeout(() => {
                selectedAyahRef.current?.scrollIntoView({ block: 'center' });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [rangeSelectorOpen]);

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
                else if (activeMode === 'translation' || activeMode === 'bilingual' || activeMode === 'en.json') url = '/en.json';
                
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
            setCurrentImagePageIndex(0);
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
        setCurrentImagePageIndex(0);
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
        if (activeMode === 'translation' || activeMode === 'bilingual' || activeMode === 'en.json') {
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

    const getAyahLength = (ay: { s: number; a: number }) => {
        const text = getAyahText(ay.s, ay.a, false) || '';
        const exp = getExplanationText(ay.s, ay.a) || '';
        return text.length + 8 + (exp ? exp.length * 0.8 : 0);
    };

    // Calculate page chunks for image sharing:
    // - Keep all selected verses in ONE single image whenever their combined content fits within
    //   a full Mushaf page (even if the selected verses straddle two Mushaf pages, e.g. 2-5 verses).
    // - Split into multiple balanced images ONLY when the selected verses exceed a full Mushaf page.
    const pageChunks = useMemo(() => {
        if (!selectedAyahs || selectedAyahs.length === 0 || !quranData) return [];

        const SINGLE_PAGE_MAX_CHARS = 1320;
        const TARGET_CHUNK_CHARS = 1150;

        // Precompute full Mushaf page text lengths for touched pages to measure true page coverage
        const touchedPages = new Set<number>();
        const ayahItems = selectedAyahs.map((ay) => {
            const ayahObj = quranData?.surahs?.[ay.s - 1]?.ayahs?.find((x: any) => x.numberInSurah === ay.a);
            const page = ayahObj?.page || 1;
            touchedPages.add(page);
            const weightedLen = getAyahLength(ay);
            const rawTextLen = (getAyahText(ay.s, ay.a, false) || '').length + 8;
            return { ay, page, weightedLen, rawTextLen };
        });

        const fullMushafPageChars = new Map<number, number>();
        if (quranData?.surahs) {
            for (const surah of quranData.surahs) {
                for (const ayah of surah.ayahs || []) {
                    if (touchedPages.has(ayah.page)) {
                        const prev = fullMushafPageChars.get(ayah.page) || 0;
                        fullMushafPageChars.set(ayah.page, prev + ((ayah.text || '').length + 8));
                    }
                }
            }
        }

        const totalWeightedChars = ayahItems.reduce((sum, item) => sum + item.weightedLen, 0);
        const totalMushafPageCoverage = ayahItems.reduce((sum, item) => {
            // Use at least a standard 15-line Mushaf page baseline (~1150 chars) so short ornamental
            // pages (like p.1-2 or short Juz Amma pages with surah headers) don't prematurely split
            const effectivePageCap = Math.max(1150, fullMushafPageChars.get(item.page) || 1150);
            return sum + item.rawTextLen / effectivePageCap;
        }, 0);

        const allSameMushafPage = touchedPages.size === 1;
        const fitsInSinglePage =
            ayahItems.length <= 1 ||
            (allSameMushafPage && readingMode === 'mushaf') ||
            (totalMushafPageCoverage <= 1.05 && totalWeightedChars <= SINGLE_PAGE_MAX_CHARS);

        const rawGroups: { ayahs: { s: number; a: number }[]; startPage: number; endPage: number }[] = [];

        if (fitsInSinglePage) {
            rawGroups.push({
                ayahs: ayahItems.map((i) => i.ay),
                startPage: ayahItems[0].page,
                endPage: ayahItems[ayahItems.length - 1].page,
            });
        } else {
            const estimatedChunks = Math.max(
                2,
                Math.ceil(Math.max(totalMushafPageCoverage, totalWeightedChars / TARGET_CHUNK_CHARS))
            );
            let chunksLeft = estimatedChunks;
            let remainingChars = totalWeightedChars;
            let currentItems: typeof ayahItems = [];
            let currentLen = 0;

            for (const item of ayahItems) {
                if (currentItems.length === 0) {
                    currentItems.push(item);
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                    continue;
                }

                const wouldExceedMax = currentLen + item.weightedLen > SINGLE_PAGE_MAX_CHARS;
                let shouldSplitForBalance = false;

                if (!wouldExceedMax && chunksLeft > 1) {
                    const idealTarget = (currentLen + remainingChars) / chunksLeft;
                    const closerWithoutItem =
                        currentLen >= idealTarget ||
                        Math.abs(currentLen - idealTarget) <= Math.abs(currentLen + item.weightedLen - idealTarget);
                    const restCanFit = remainingChars <= (chunksLeft - 1) * SINGLE_PAGE_MAX_CHARS;
                    if (closerWithoutItem && restCanFit) {
                        shouldSplitForBalance = true;
                    }
                }

                if (wouldExceedMax || shouldSplitForBalance) {
                    rawGroups.push({
                        ayahs: currentItems.map((i) => i.ay),
                        startPage: currentItems[0].page,
                        endPage: currentItems[currentItems.length - 1].page,
                    });
                    chunksLeft = Math.max(1, chunksLeft - 1);
                    currentItems = [item];
                    currentLen = item.weightedLen;
                    remainingChars -= item.weightedLen;
                } else {
                    currentItems.push(item);
                    currentLen += item.weightedLen;
                    remainingChars -= item.weightedLen;
                }
            }

            if (currentItems.length > 0) {
                rawGroups.push({
                    ayahs: currentItems.map((i) => i.ay),
                    startPage: currentItems[0].page,
                    endPage: currentItems[currentItems.length - 1].page,
                });
            }
        }

        const totalPages = rawGroups.length;

        return rawGroups.map((grp, idx) => {
            const first = grp.ayahs[0];
            const last = grp.ayahs[grp.ayahs.length - 1];
            const pageNum = idx + 1;
            const totalChars = grp.ayahs.reduce((sum, ay) => sum + getAyahLength(ay), 0);

            const surahName = getSurahName(first.s);
            let surahInfoText = '';
            if (first.s === last.s) {
                if (first.a === last.a) {
                    surahInfoText = `سورة ${surahName} - آية ${toArabic(first.a)}`;
                } else {
                    surahInfoText = `سورة ${surahName} - الآيات ${toArabic(first.a)} إلى ${toArabic(last.a)}`;
                }
            } else {
                surahInfoText = `سورة ${surahName} آية ${toArabic(first.a)} - سورة ${getSurahName(last.s)} آية ${toArabic(last.a)}`;
            }

            const mushafPageLabel =
                grp.startPage === grp.endPage
                    ? `صفحة المصحف ${toArabic(grp.startPage)}`
                    : `صفحة المصحف ${toArabic(grp.startPage)} - ${toArabic(grp.endPage)}`;

            if (totalPages > 1) {
                surahInfoText += ` (صورة ${toArabic(pageNum)} من ${toArabic(totalPages)} - ${mushafPageLabel})`;
            } else {
                surahInfoText += ` (${mushafPageLabel})`;
            }

            return {
                pageNumber: pageNum,
                totalPages,
                mushafPage: grp.startPage,
                endMushafPage: grp.endPage,
                mushafPageLabel,
                ayahs: grp.ayahs,
                fromAyah: first.a,
                toAyah: last.a,
                totalChars,
                surahInfoText
            };
        });
    }, [selectedAyahs, quranData, explanationData, readingMode]);

    const safePageIndex = Math.min(currentImagePageIndex, Math.max(0, (pageChunks.length || 1) - 1));
    const currentPageChunk = pageChunks[safePageIndex] || pageChunks[0];

    const userRatio = (fontSize || 20) / 20;

    const getChunkTypography = (chunkChars: number, ratio: number = 1) => {
        let baseSize: number;
        let lineHeight: number;
        let bismillahSize: number;

        if (chunkChars < 60) {
            baseSize = 124;
            lineHeight = 2.45;
            bismillahSize = 64;
        } else if (chunkChars < 120) {
            baseSize = 108;
            lineHeight = 2.35;
            bismillahSize = 60;
        } else if (chunkChars < 220) {
            baseSize = 94;
            lineHeight = 2.25;
            bismillahSize = 56;
        } else if (chunkChars < 350) {
            baseSize = 82;
            lineHeight = 2.15;
            bismillahSize = 52;
        } else if (chunkChars < 500) {
            baseSize = 72;
            lineHeight = 2.08;
            bismillahSize = 48;
        } else if (chunkChars < 680) {
            baseSize = 65;
            lineHeight = 2.02;
            bismillahSize = 46;
        } else if (chunkChars < 880) {
            baseSize = 60;
            lineHeight = 1.98;
            bismillahSize = 44;
        } else if (chunkChars < 1080) {
            baseSize = 54;
            lineHeight = 1.90;
            bismillahSize = 42;
        } else if (chunkChars < 1240) {
            baseSize = 48;
            lineHeight = 1.82;
            bismillahSize = 40;
        } else {
            baseSize = 44;
            lineHeight = 1.76;
            bismillahSize = 38;
        }

        const maxSafeFontSize = chunkChars >= 1200 ? 50 : chunkChars >= 1000 ? 58 : chunkChars >= 800 ? 68 : 135;
        const ayahFontSize = Math.min(maxSafeFontSize, Math.max(38, Math.round(baseSize * ratio)));
        const explanationFontSize = Math.max(24, Math.round(ayahFontSize * 0.62));
        return { ayahFontSize, lineHeight, bismillahSize, explanationFontSize };
    };

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

    const pageTotalChars = useMemo(() => {
        return pageAyahs.reduce((sum, ay) => sum + (ay.text ? ay.text.length : 0), 0);
    }, [pageAyahs]);

    const pageTypography = useMemo(() => {
        let fontSize: number;
        let lineHeight: number;
        if (pageTotalChars < 250) {
            fontSize = 62;
            lineHeight = 2.45;
        } else if (pageTotalChars < 450) {
            fontSize = 56;
            lineHeight = 2.38;
        } else if (pageTotalChars < 650) {
            fontSize = 52;
            lineHeight = 2.30;
        } else if (pageTotalChars < 850) {
            fontSize = 48;
            lineHeight = 2.22;
        } else if (pageTotalChars < 1050) {
            fontSize = 44;
            lineHeight = 2.14;
        } else {
            fontSize = 41;
            lineHeight = 2.06;
        }
        return { fontSize, lineHeight };
    }, [pageTotalChars]);

    const handleShare = async (shareMode: 'all' | 'current' = 'all') => {
        if (isSharing) return;
        setIsSharing(true);
        
        let shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
        
        if (shareType === 'page') {
            let pageSurahInfo = surahInfo;
            if (pageAyahs.length > 0) {
                const firstPageAyah = pageAyahs[0];
                const lastPageAyah = pageAyahs[pageAyahs.length - 1];
                pageSurahInfo = firstPageAyah.sNum === lastPageAyah.sNum 
                    ? `سورة ${getSurahName(firstPageAyah.sNum)} - آية ${toArabic(firstPageAyah.numberInSurah)} إلى آية ${toArabic(lastPageAyah.numberInSurah)}`
                    : `سورة ${getSurahName(firstPageAyah.sNum)} آية ${toArabic(firstPageAyah.numberInSurah)} - سورة ${getSurahName(lastPageAyah.sNum)} آية ${toArabic(lastPageAyah.numberInSurah)}`;
            }
            
            shareText = `صفحة ${toArabic(pageNum)} - ${pageSurahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
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
            } else if (shareType === 'image') {
                try {
                    setIsSharing(true);
                    const isSinglePage = pageChunks.length <= 1 || shareMode === 'current';
                    const targetChunks = isSinglePage ? [currentPageChunk] : pageChunks;
                    const targetIndices = isSinglePage ? [safePageIndex] : pageChunks.map((_, i) => i);

                    const capturedImages: { dataUrl: string; chunk: typeof currentPageChunk }[] = [];

                    for (let i = 0; i < targetIndices.length; i++) {
                        const chunkIdx = targetIndices[i];
                        const captureElement = hiddenCapturePagesRef.current[chunkIdx] || hiddenImageCaptureRef.current;
                        if (!captureElement) continue;

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
                        await new Promise(r => setTimeout(r, 60));

                        const canvas = await safeHtml2Canvas(captureElement, {
                            scale: 1, // 1080x1920 native scale
                            backgroundColor: null,
                            useCORS: true,
                            logging: false,
                            imageTimeout: 15000,
                            removeContainer: true
                        });
                        
                        // Guarantee exact 1080x1920 output dimensions for story/status format
                        let finalCanvas = canvas;
                        if (canvas.width !== 1080 || canvas.height !== 1920) {
                            const resized = document.createElement('canvas');
                            resized.width = 1080;
                            resized.height = 1920;
                            const rCtx = resized.getContext('2d')!;
                            rCtx.imageSmoothingEnabled = true;
                            rCtx.imageSmoothingQuality = 'high';
                            rCtx.drawImage(canvas, 0, 0, 1080, 1920);
                            finalCanvas = resized;
                        }
                        
                        const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
                        captureElement.style.cssText = originalStyle;

                        if (dataUrl && dataUrl !== 'data:,') {
                            capturedImages.push({ dataUrl, chunk: targetChunks[i] });
                        }
                    }

                    if (capturedImages.length === 0) {
                        throw new Error('Failed to generate image data');
                    }

                    if (Capacitor.isNativePlatform()) {
                        const fileUris: string[] = [];
                        for (let i = 0; i < capturedImages.length; i++) {
                            const fileName = `quran_page_${capturedImages[i].chunk.mushafPage}_part${i + 1}_${Date.now()}.jpg`;
                            const base64Data = capturedImages[i].dataUrl.split(',')[1];
                            const savedFile = await Filesystem.writeFile({
                                path: fileName,
                                data: base64Data,
                                directory: Directory.Cache,
                            });
                            fileUris.push(savedFile.uri);
                        }
                        
                        if (fileUris.length > 1) {
                            await Share.share({
                                title: 'مشاركة آيات قرآنية',
                                text: shareText,
                                files: fileUris,
                                dialogTitle: 'مشاركة الصور عبر'
                            });
                        } else {
                            await Share.share({
                                title: 'مشاركة آية',
                                text: shareText,
                                url: fileUris[0],
                                dialogTitle: 'مشاركة عبر'
                            });
                        }
                    } else if (navigator.share) {
                        try {
                            const files: File[] = [];
                            for (let i = 0; i < capturedImages.length; i++) {
                                const response = await fetch(capturedImages[i].dataUrl);
                                const blob = await response.blob();
                                files.push(new File([blob], `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}.jpg`, { type: 'image/jpeg' }));
                            }
                            
                            if (navigator.canShare && navigator.canShare({ files })) {
                                await navigator.share({
                                    title: 'مشاركة آيات قرآنية',
                                    text: shareText,
                                    files: files,
                                });
                            } else {
                                // If multi-file share is not supported by user browser, download them:
                                for (let i = 0; i < capturedImages.length; i++) {
                                    const link = document.createElement('a');
                                    link.download = `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}_${Date.now()}.jpg`;
                                    link.href = capturedImages[i].dataUrl;
                                    link.click();
                                    await new Promise(r => setTimeout(r, 150));
                                }
                                showToast?.(capturedImages.length > 1 ? `تم حفظ ${toArabic(capturedImages.length)} صور في التنزيلات` : 'تم حفظ الصورة');
                            }
                        } catch (e: any) {
                            const errorMsg = e?.message || String(e);
                            if (e.name === 'AbortError' || errorMsg.includes('Share canceled') || errorMsg.includes('canceled')) {
                                console.log('Image share interaction finished');
                            } else if (errorMsg.includes('user gesture')) {
                                for (let i = 0; i < capturedImages.length; i++) {
                                    const link = document.createElement('a');
                                    link.download = `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}_${Date.now()}.jpg`;
                                    link.href = capturedImages[i].dataUrl;
                                    link.click();
                                    await new Promise(r => setTimeout(r, 150));
                                }
                                showToast?.("تم حفظ الصور (انتهت صلاحية الإيماءة)");
                            } else {
                                console.error('Inner share error:', e);
                                await navigator.share({ title: 'مشاركة آية', text: shareText }).catch(() => {});
                            }
                        }
                    } else {
                        // Fallback: download all images
                        for (let i = 0; i < capturedImages.length; i++) {
                            const link = document.createElement('a');
                            link.download = `quran_page_${capturedImages[i].chunk.mushafPage}_part_${i + 1}_${Date.now()}.jpg`;
                            link.href = capturedImages[i].dataUrl;
                            link.click();
                            await new Promise(r => setTimeout(r, 150));
                        }
                        showToast?.(capturedImages.length > 1 ? `تم تحميل ${toArabic(capturedImages.length)} صور بنجاح` : "تم تحميل الصورة");
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
                        const canvas = await safeHtml2Canvas(captureElement, {
                            scale: 1,
                            backgroundColor: '#ffffff',
                            useCORS: true,
                            logging: false,
                            imageTimeout: 15000,
                            removeContainer: true
                        });
                        
                        // Guarantee exact 1080x1920 mobile story dimensions
                        let finalCanvas = canvas;
                        if (canvas.width !== 1080 || canvas.height !== 1920) {
                            const resized = document.createElement('canvas');
                            resized.width = 1080;
                            resized.height = 1920;
                            const rCtx = resized.getContext('2d')!;
                            rCtx.fillStyle = '#ffffff';
                            rCtx.fillRect(0, 0, 1080, 1920);
                            rCtx.imageSmoothingEnabled = true;
                            rCtx.imageSmoothingQuality = 'high';
                            rCtx.drawImage(canvas, 0, 0, 1080, 1920);
                            finalCanvas = resized;
                        }

                        const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);

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

                // Custom file name formatted exactly: سورة [اسم السورة] الايه01 أو سورة [اسم السورة] الايه من 01 الى 20
                const surahName = getSurahName(currentAyah.s);
                const fromStr = String(start).padStart(2, '0');
                const toStr = String(end).padStart(2, '0');
                const fileName = start === end 
                    ? `سورة ${surahName} الايه${fromStr}.mp3` 
                    : `سورة ${surahName} الايه من ${fromStr} الى ${toStr}.mp3`;

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
        const shareText = `${surahInfo}\nآيات من القرآن الكريم . بواسطة : مصحف أحمد و ليلى`;
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
        const cleanName = (surahName || '').replace(/سورة|سُورَةُ|سُورَة/g, '').trim();
        const surahType = surahInfo?.type || 'مكية';
        const ayahCountText = getAyahCountText(surahInfo?.ayahs || 0);

        return (
            <div style={{ 
                width: '100%', 
                marginBottom: '28px', 
                padding: '24px 36px',
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: '4px solid #16a34a',
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', fontFamily: 'var(--font-hafs), serif', minWidth: '120px', textAlign: 'right' }}>
                        {surahType}
                    </span>
                    <h2 style={{ fontSize: '56px', fontWeight: 'bold', color: '#0f172a', fontFamily: 'var(--font-amiri-quran), serif', margin: 0, textAlign: 'center', flex: 1 }}>
                        سُورَةُ {cleanName}
                    </h2>
                    <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a', fontFamily: 'var(--font-hafs), serif', minWidth: '120px', textAlign: 'left' }}>
                        {ayahCountText}
                    </span>
                </div>
                <div style={{ width: '35%', height: '4px', backgroundColor: '#16a34a', opacity: 0.7, borderRadius: '2px' }}></div>
            </div>
        );
    };

    return (
        <div className="fixed z-[1200] bg-black/40 backdrop-blur-sm flex items-center justify-center overflow-hidden" style={{ top: 0, bottom: 0, left: 0, right: 0 }} dir="rtl" onClick={onClose}>
            {/* Hidden capture elements for High Quality Image Share (Exact 1080x1920 Story format) */}
            <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', pointerEvents: 'none' }}>
                {pageChunks.map((chunk, chunkIdx) => {
                    const chunkTypo = getChunkTypography(chunk.totalChars, userRatio);
                    const isShort = chunk.totalChars < 280;
                    const chunkExplanation = chunk.ayahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');
                    return (
                        <div 
                            key={`capture-chunk-${chunkIdx}`}
                            id={chunkIdx === 0 ? "hidden-image-capture" : `hidden-image-capture-${chunkIdx}`}
                            ref={chunkIdx === 0 ? hiddenImageCaptureRef : (el) => { hiddenCapturePagesRef.current[chunkIdx] = el; }}
                            style={{
                                position: 'relative',
                                width: '1080px',
                                height: '1920px',
                                minHeight: '1920px',
                                maxHeight: '1920px',
                                boxSizing: 'border-box',
                                borderRadius: '36px',
                                overflow: 'hidden',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '52px 64px 38px 64px',
                                textAlign: 'center',
                                backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                                backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                border: `12px solid ${selectedBg.border}`,
                                direction: isEn ? 'ltr' : 'rtl'
                            }}
                        >
                            {selectedBg.id !== 'bg_white' && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.22)' }}></div>
                            )}
                            <FrameOverlay frame={selectedFrame} scale={4} />
                            <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', height: '100%', flex: 1 }}>
                                {/* Top Bismillah Header */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '10px' }}>
                                    {readingMode === 'mushaf' && (
                                        <p 
                                            style={{ 
                                                fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                                fontSize: `${chunkTypo.bismillahSize}px`, 
                                                color: selectedBg.accent, 
                                                margin: 0,
                                                textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 6px 12px rgba(0,0,0,0.5)',
                                                fontWeight: 'bold'
                                            }}
                                        >
                                            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                        </p>
                                    )}
                                    {isShort && <IslamicFlourish color={selectedBg.accent} scale={2} />}
                                </div>

                                {/* Middle Verse & Explanation auto-centered & adaptively sized to fill full page */}
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', padding: '12px 0', minHeight: 0 }}>
                                    <p 
                                        className="share-preview-text"
                                        style={{ 
                                            lineHeight: chunkTypo.lineHeight,
                                            fontFamily: selectedFont,
                                            fontSize: `${chunkTypo.ayahFontSize}px`, 
                                            color: textColor,
                                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 6px 14px rgba(0,0,0,0.55)',
                                            margin: 0,
                                            fontWeight: 'bold',
                                            whiteSpace: 'normal',
                                            letterSpacing: 0,
                                            wordBreak: 'keep-all',
                                            fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                            textRendering: 'optimizeLegibility',
                                            textAlign: 'center',
                                            width: '100%'
                                        }}
                                    >
                                        {chunk.ayahs.map((ay, idx) => (
                                            <React.Fragment key={idx}>
                                                <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                                {` ﴿${toArabic(ay.a)}﴾ `}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    {chunkExplanation && (
                                        <p style={{
                                            fontFamily: 'var(--font-cairo), sans-serif',
                                            fontSize: `${chunkTypo.explanationFontSize}px`,
                                            color: textColor,
                                            opacity: 0.92,
                                            marginTop: '28px',
                                            textAlign: 'center',
                                            lineHeight: '1.65',
                                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 4px 8px rgba(0,0,0,0.5)',
                                            maxWidth: '94%'
                                        }}>
                                            {chunkExplanation}
                                        </p>
                                    )}
                                    {isShort && <IslamicFlourish color={selectedBg.accent} scale={2} />}
                                </div>

                                {/* Bottom Metadata & Footer */}
                                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingBottom: '16px', gap: '14px' }}>
                                    <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: '32px', fontWeight: 'bold', opacity: 0.95, textAlign: 'center', margin: 0 }}>
                                        {chunk.surahInfoText}
                                    </p>
                                    <div style={{ width: '60%', borderTop: '2px solid rgba(255, 255, 255, 0.35)' }}></div>
                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                        <a 
                                            href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ fontFamily: 'var(--font-lateef), serif', color: selectedBg.accent, textShadow: '0 3px 9px rgba(0,0,0,0.8)', fontSize: '42px', fontWeight: 700, textAlign: 'center', textDecoration: 'none' }} 
                                            dir={isEn ? 'ltr' : 'rtl'}
                                        >
                                            {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                        </a>
                                        {customText ? (
                                            <span 
                                                style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 3px 6px rgba(0,0,0,0.5)', fontSize: '24px', fontWeight: 500, maxWidth: '85%', textAlign: 'center', lineHeight: 1.25, opacity: 0.9 }} 
                                            >
                                                {customText}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Unified capture element for high-quality page share (Mushaf, Tafseer, Meanings, Translation) */}
            <div 
                id="hidden-mushaf-capture"
                ref={hiddenMushafRef}
                style={{
                    position: 'absolute',
                    left: '-9999px',
                    top: '-9999px',
                    width: '1080px', 
                    height: '1920px',
                    minHeight: '1920px',
                    maxHeight: '1920px',
                    backgroundColor: '#ffffff',
                    padding: '36px 48px 24px',
                    boxSizing: 'border-box',
                    color: '#000000',
                    direction: 'rtl',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
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
                        font-size: ${pageTypography.fontSize}px !important;
                        line-height: ${pageTypography.lineHeight} !important;
                    }
                    #hidden-mushaf-capture .mushaf-page {
                        flex: 1 1 auto !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        min-height: 0 !important;
                        width: 100% !important;
                        background: transparent !important;
                    }
                    #hidden-mushaf-capture .mushaf-page .page-content {
                        flex: 1 1 auto !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-evenly !important;
                        min-height: 0 !important;
                        width: 100% !important;
                        font-size: ${pageTypography.fontSize}px !important;
                        line-height: ${pageTypography.lineHeight} !important;
                    }
                    #hidden-mushaf-capture .mushaf-page .page-footer {
                        margin-top: 12px !important;
                        margin-bottom: 6px !important;
                        flex-shrink: 0 !important;
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
                        settings={{ ...(appSettings || {}), fontSize: pageTypography.fontSize / 16, fontFamily: 'var(--font-amiri-quran)', textColor: '#000000' }}
                        currentTheme={currentTheme}
                    />
                ) : (
                    <div style={{ padding: '10px 8px 5px', flex: '1 1 auto', display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', minHeight: 0 }}>
                        {pageAyahs.map((ay, idx) => {
                            const ayahText = getAyahText(ay.sNum, ay.numberInSurah);
                            const explanation = getExplanationText(ay.sNum, ay.numberInSurah);
                            const isNewSurah = idx === 0 || pageAyahs[idx-1].sNum !== ay.sNum;
                            
                            return (
                                <div key={`${ay.sNum}-${ay.numberInSurah}`} style={{ marginBottom: '20px' }}>
                                    {isNewSurah && idx > 0 && (
                                        <div style={{ textAlign: 'center', margin: '24px 0', padding: '10px', backgroundColor: `rgba(22, 163, 74, 0.1)`, borderRadius: '12px' }}>
                                            <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: '#16a34a' }}>سورة {getSurahName(ay.sNum)}</h3>
                                        </div>
                                    )}
                                    <div style={{ 
                                        fontSize: `${pageTypography.fontSize}px`, 
                                        lineHeight: pageTypography.lineHeight, 
                                        fontFamily: 'var(--font-amiri-quran), serif',
                                        color: '#000000',
                                        marginBottom: explanation ? '12px' : '0',
                                        textAlign: 'justify',
                                        textAlignLast: 'right'
                                    }}>
                                        {ayahText} <span style={{ color: '#9333ea', fontFamily: 'var(--font-hafs), serif', margin: '0 4px' }}>﴿{toArabic(ay.numberInSurah)}﴾</span>
                                    </div>
                                    {explanation && (
                                        <div style={{
                                            fontSize: `${Math.round(pageTypography.fontSize * 0.62)}px`, 
                                            lineHeight: '1.7', 
                                            fontFamily: 'var(--font-default), sans-serif',
                                            color: '#333333',
                                            textAlign: 'justify',
                                            textAlignLast: 'right',
                                            backgroundColor: '#f8fafc',
                                            padding: '16px 22px',
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

                <div 
                    id="hidden-mushaf-footer"
                    style={{ 
                        marginTop: 'auto', 
                        flexShrink: 0,
                        paddingTop: '16px', 
                        paddingBottom: '24px', 
                        borderTop: '3px solid #3b82f6', 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px',
                        letterSpacing: 0,
                        wordSpacing: 0,
                        width: '100%'
                    }}
                >
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', letterSpacing: 0, wordSpacing: 0 }}>
                        <a href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'var(--font-lateef), serif', fontSize: '36px', color: '#3b82f6', fontWeight: 'bold', textDecoration: 'none', letterSpacing: 0, wordSpacing: 0, fontVariantLigatures: 'normal' }}>{isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}</a>
                    </div>
                </div>
            </div>

            <div className="w-full h-full flex flex-col overflow-hidden shadow-none border-0" style={{ backgroundColor: currentTheme.bg || '#ffffff' }} onClick={e => e.stopPropagation()}>
                <div className="flex-1 w-full flex flex-col overflow-hidden" style={{ color: currentTheme.text || '#000000' }}>
                    
                    {/* Full Screen Modal Header */}
                    <div className="p-3 border-b flex items-center justify-center shrink-0" style={{ backgroundColor: currentTheme.bg || '#ffffff', borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)', paddingTop: 'calc(0.75rem + env(safe-area-inset-top))' }}>
                        <h3 className="text-sm font-bold" style={{ color: currentTheme.text }}>خيارات المشاركة</h3>
                    </div>

                    {/* Sticky Header Section */}
                    <div className="p-3 pb-2 border-b shrink-0 z-10" style={{ backgroundColor: currentTheme.bg, borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}>
                        {/* Share Type Selector */}
                        <div className="flex rounded-xl p-1.5 gap-1.5" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}>
                            <button onClick={() => setShareType('text')} className={`flex-1 py-2 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 border-none transition-all quran-raised-btn ${shareType === 'text' ? 'quran-raised-btn-selected text-white' : ''}`} style={{ backgroundColor: shareType === 'text' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg, color: shareType === 'text' ? '#fff' : currentTheme.text }}>
                                <Type size={14} className="quran-3d-icon" /> نص
                            </button>
                            <button onClick={() => setShareType('image')} className={`flex-1 py-2 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 border-none transition-all quran-raised-btn ${shareType === 'image' ? 'quran-raised-btn-selected text-white' : ''}`} style={{ backgroundColor: shareType === 'image' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg, color: shareType === 'image' ? '#fff' : currentTheme.text }}>
                                <ImageIcon size={14} className="quran-3d-icon" /> صورة
                            </button>
                            <button onClick={() => setShareType('page')} className={`flex-1 py-2 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 border-none transition-all quran-raised-btn ${shareType === 'page' ? 'quran-raised-btn-selected text-white' : ''}`} style={{ backgroundColor: shareType === 'page' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg, color: shareType === 'page' ? '#fff' : currentTheme.text }}>
                                <FileText size={14} className="quran-3d-icon" /> صفحة
                            </button>
                            <button onClick={() => setShareType('audio')} className={`flex-1 py-2 text-[12px] font-bold rounded-xl flex items-center justify-center gap-1.5 border-none transition-all quran-raised-btn ${shareType === 'audio' ? 'quran-raised-btn-selected text-white' : ''}`} style={{ backgroundColor: shareType === 'audio' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg, color: shareType === 'audio' ? '#fff' : currentTheme.text }}>
                                <Volume2 size={14} className="quran-3d-icon" /> صوت
                            </button>
                        </div>

                        {/* Range Selector */}
                        <div className={`flex justify-between items-center p-2 rounded-2xl gap-3 mt-3 transition-all ${shareType === 'page' ? 'opacity-50 pointer-events-none' : ''}`} style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                            <div className="flex-1">
                                <label className="block text-[10px] text-center mb-1 font-bold opacity-50" style={{ color: currentTheme.text }}>من</label>
                                <button 
                                    onClick={() => setRangeSelectorOpen('from')}
                                    className="w-full py-2.5 px-3 text-[12px] border-none rounded-xl text-center quran-raised-btn transition-all font-bold"
                                    style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
                                >
                                    {getSurahName(currentAyah.s)} {toArabic(fromAyah)}
                                </button>
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] text-center mb-1 font-bold opacity-50" style={{ color: currentTheme.text }}>إلى</label>
                                <button 
                                    onClick={() => setRangeSelectorOpen('to')}
                                    className="w-full py-2.5 px-3 text-[12px] border-none rounded-xl text-center quran-raised-btn transition-all font-bold"
                                    style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}
                                >
                                    {getSurahName(currentAyah.s)} {toArabic(toAyah)}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    {/* Scrollable Content */}
                    <div className={`p-4 overflow-y-auto flex-1 flex flex-col items-center ${shareType === 'image' ? 'justify-center' : ''}`}>
                        {/* Multi-page switcher when ayahs are split across images */}
                        {shareType === 'image' && pageChunks.length > 1 && (
                            <div className="flex items-center justify-between w-full max-w-[380px] mb-3 px-3 py-1.5 rounded-xl border-none shadow-md transition-all" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)' }}>
                                <button
                                    onClick={() => setCurrentImagePageIndex(prev => Math.max(0, prev - 1))}
                                    disabled={safePageIndex === 0}
                                    className="p-1.5 rounded-lg disabled:opacity-25 quran-raised-btn border-none transition-all flex items-center gap-1 text-xs font-bold"
                                    style={{ color: currentTheme.text, backgroundColor: currentTheme.bg }}
                                    title="الصورة السابقة"
                                >
                                    <ChevronRight size={16} className="quran-3d-icon" />
                                    <span>السابق</span>
                                </button>
                                <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: currentTheme.accent || '#3b82f6' }}>
                                    <Images size={15} className="quran-3d-icon" />
                                    <span>صورة {toArabic(safePageIndex + 1)} من {toArabic(pageChunks.length)}</span>
                                    <span className="text-[10px] opacity-80 font-normal">
                                        ({currentPageChunk.mushafPageLabel} | {currentPageChunk.fromAyah === currentPageChunk.toAyah ? `آية ${toArabic(currentPageChunk.fromAyah)}` : `آية ${toArabic(currentPageChunk.fromAyah)} - ${toArabic(currentPageChunk.toAyah)}`})
                                    </span>
                                </div>
                                <button
                                    onClick={() => setCurrentImagePageIndex(prev => Math.min(pageChunks.length - 1, prev + 1))}
                                    disabled={safePageIndex >= pageChunks.length - 1}
                                    className="p-1.5 rounded-lg disabled:opacity-25 quran-raised-btn border-none transition-all flex items-center gap-1 text-xs font-bold"
                                    style={{ color: currentTheme.text, backgroundColor: currentTheme.bg }}
                                    title="الصورة التالية"
                                >
                                    <span>التالي</span>
                                    <ChevronLeft size={16} className="quran-3d-icon" />
                                </button>
                            </div>
                        )}

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
                                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center z-[30] rounded-xl border-none shadow-lg animate-fadeIn">
                                        <FileText size={48} className="text-emerald-600 mb-3 quran-3d-icon" />
                                        <span className="font-bold text-emerald-800 text-lg">مشاركة الصفحة كاملة</span>
                                        <span className="text-sm text-gray-500 mt-2 px-4 text-center">سيتم تصدير الصفحة {toArabic(pageNum)} بجودة فائقة الدقة (4K)</span>
                                    </div>
                                )}

                                {shareType === 'audio' && (
                                    <div className="absolute top-4 left-4 right-4 bg-blue-500/10 backdrop-blur-md border-none py-2 px-4 rounded-full flex items-center justify-center gap-2 z-[30] animate-fadeIn quran-raised-card">
                                        <Volume2 size={16} className="text-blue-600 quran-3d-icon" />
                                        <span className="font-bold text-blue-800 dark:text-blue-200 text-xs">مشاركة تلاوة صوتية</span>
                                    </div>
                                )}

                                {shareType === 'text' && (
                                    <div className="absolute top-4 left-4 right-4 bg-gray-500/10 backdrop-blur-md border-none py-2 px-4 rounded-full flex items-center justify-center gap-2 z-[30] animate-fadeIn quran-raised-card">
                                        <Type size={16} className="text-gray-600 dark:text-gray-200 quran-3d-icon" />
                                        <span className="font-bold text-gray-800 dark:text-gray-100 text-xs">مشاركة النص فقط</span>
                                    </div>
                                )}

                                <FrameOverlay frame={selectedFrame} />
                                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', width: '100%', flex: 1 }}>
                                    {shareType === 'image' ? (() => {
                                        const currentChunkTypo = getChunkTypography(currentPageChunk.totalChars, userRatio);
                                        const previewAyahFontSize = Math.max(14, Math.round(currentChunkTypo.ayahFontSize * 0.30));
                                        const previewBismillahFontSize = Math.max(12, Math.round(currentChunkTypo.bismillahSize * 0.30));
                                        const previewIsShort = currentPageChunk.totalChars < 280;
                                        const previewExplanation = currentPageChunk.ayahs.map(ay => getExplanationText(ay.s, ay.a)).filter(t => t).join('\n');

                                        return (
                                            <div style={{ padding: '8px 0', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                                                {readingMode === 'mushaf' && (
                                                    <p 
                                                        style={{ 
                                                            fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif', 
                                                            fontSize: `${previewBismillahFontSize}px`, 
                                                            color: selectedBg.accent, 
                                                            marginBottom: '12px',
                                                            textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                                            opacity: 1,
                                                            marginTop: '4px',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                                                    </p>
                                                )}
                                                {previewIsShort && <IslamicFlourish color={selectedBg.accent} scale={0.7} />}
                                                <p 
                                                    className="share-preview-text"
                                                    style={{ 
                                                        lineHeight: currentChunkTypo.lineHeight,
                                                        fontFamily: selectedFont,
                                                        fontSize: `${previewAyahFontSize}px`, 
                                                        color: textColor,
                                                        textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 2px 4px rgba(0,0,0,0.5)',
                                                        margin: 0,
                                                        marginTop: '6px',
                                                        fontWeight: 'bold',
                                                        whiteSpace: 'normal',
                                                        letterSpacing: 0,
                                                        wordBreak: 'keep-all',
                                                        fontFeatureSettings: '"kern", "liga", "clig", "calt", "ccmp"',
                                                        textRendering: 'optimizeLegibility',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {currentPageChunk.ayahs.map((ay, idx) => (
                                                        <React.Fragment key={idx}>
                                                            <span style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(getAyahText(ay.s, ay.a, false)) }} />
                                                            {` ﴿${toArabic(ay.a)}﴾ `}
                                                        </React.Fragment>
                                                    ))}
                                                </p>
                                                {previewExplanation && (
                                                    <p style={{
                                                        fontFamily: 'var(--font-cairo), sans-serif',
                                                        fontSize: `${Math.max(11, Math.round(previewAyahFontSize * 0.65))}px`,
                                                        color: textColor,
                                                        opacity: 0.9,
                                                        marginTop: '10px',
                                                        textAlign: 'center',
                                                        lineHeight: '1.5',
                                                        textShadow: selectedBg.id === 'bg_white' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                                                        maxWidth: '90%'
                                                    }}>
                                                        {previewExplanation}
                                                    </p>
                                                )}
                                                {previewIsShort && <IslamicFlourish color={selectedBg.accent} scale={0.7} />}
                                            </div>
                                        );
                                    })() : (
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

                                    <div style={{ marginTop: shareType === 'image' ? '14px' : '10px', width: '100%', paddingLeft: '4px', paddingRight: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                        {shareType === 'image' && (
                                            <p style={{ fontFamily: selectedFont, color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '11px', fontWeight: 'bold', opacity: 0.95, textAlign: 'center', margin: '0 0 4px 0' }}>
                                                {currentPageChunk.surahInfoText}
                                            </p>
                                        )}
                                        <div style={{ width: '60%', borderTop: '2px solid rgba(255, 255, 255, 0.4)', margin: '4px 0' }}></div>
                                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                            <a 
                                                href="https://play.google.com/store/apps/details?id=com.mushaf.ahmedandlayla"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ fontFamily: 'var(--font-scheherazade), serif', color: selectedBg.accent, textShadow: '0 1px 4px rgba(0,0,0,0.8)', fontSize: '16px', fontWeight: 800, textAlign: 'center', textDecoration: 'none' }} 
                                                dir="rtl"
                                            >
                                                {isEn ? 'Mushaf Ahmed & Laila' : 'مصحف أحمد و ليلى'}
                                            </a>
                                            {customText ? (
                                                <span 
                                                    style={{ fontFamily: 'var(--font-scheherazade), serif', color: textColor, textShadow: '0 1px 2px rgba(0,0,0,0.5)', fontSize: '12px', fontWeight: 600, maxWidth: '90%', textAlign: 'center', lineHeight: 1.2, opacity: 0.9 }} 
                                                >
                                                    {customText}
                                                </span>
                                            ) : null}
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
                            <div className="grid grid-cols-4 gap-2 p-1.5 rounded-xl w-full mx-auto" style={{ backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'bg' ? null : 'bg')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 border-none quran-raised-btn ${activeDesignTab === 'bg' ? 'quran-raised-btn-selected' : ''}`}
                                    style={{ 
                                        backgroundColor: activeDesignTab === 'bg' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
                                        color: activeDesignTab === 'bg' ? '#ffffff' : currentTheme.text
                                    }}
                                >
                                    <ImageIcon size={14} className="quran-3d-icon" />
                                    <span>الخلفية</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'frame' ? null : 'frame')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 border-none quran-raised-btn ${activeDesignTab === 'frame' ? 'quran-raised-btn-selected' : ''}`}
                                    style={{ 
                                        backgroundColor: activeDesignTab === 'frame' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
                                        color: activeDesignTab === 'frame' ? '#ffffff' : currentTheme.text
                                    }}
                                >
                                    <LayoutTemplate size={14} className="quran-3d-icon" />
                                    <span>الإطار</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'text' ? null : 'text')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 border-none quran-raised-btn ${activeDesignTab === 'text' ? 'quran-raised-btn-selected' : ''}`}
                                    style={{ 
                                        backgroundColor: activeDesignTab === 'text' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
                                        color: activeDesignTab === 'text' ? '#ffffff' : currentTheme.text
                                    }}
                                >
                                    <Palette size={14} className="quran-3d-icon" />
                                    <span>النص</span>
                                </button>
                                <button 
                                    onClick={() => setActiveDesignTab(activeDesignTab === 'font' ? null : 'font')}
                                    className={`py-2 px-1 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex flex-col items-center gap-1 border-none quran-raised-btn ${activeDesignTab === 'font' ? 'quran-raised-btn-selected' : ''}`}
                                    style={{ 
                                        backgroundColor: activeDesignTab === 'font' ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
                                        color: activeDesignTab === 'font' ? '#ffffff' : currentTheme.text
                                    }}
                                >
                                    <Type size={14} className="quran-3d-icon" />
                                    <span>الخط</span>
                                </button>
                            </div>

                            {/* Active Tab Content */}
                            <div className="transition-all duration-300 overflow-hidden" style={{ maxHeight: activeDesignTab ? '200px' : '0', opacity: activeDesignTab ? 1 : 0, marginTop: activeDesignTab ? '8px' : '0' }}>
                                <div className="p-3 rounded-2xl border-none shadow-md" style={{ backgroundColor: currentTheme.bg }}>
                                    {/* Background Selection */}
                                    {activeDesignTab === 'bg' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar p-1">
                                                {BACKGROUNDS.map(bg => (
                                                    <button
                                                        key={bg.id}
                                                        onClick={() => setSelectedBg(bg)}
                                                        className={`w-10 h-10 rounded-xl shrink-0 border-none transition-all quran-raised-btn ${selectedBg.id === bg.id ? 'quran-raised-btn-selected scale-110' : ''}`}
                                                        style={{
                                                            backgroundColor: bg.type === 'solid' ? bg.value : undefined,
                                                            backgroundImage: bg.type !== 'solid' ? bg.value : undefined,
                                                            backgroundSize: 'cover',
                                                            backgroundPosition: 'center'
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Frame Selection */}
                                    {activeDesignTab === 'frame' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar p-1">
                                                {FRAMES.map(frame => (
                                                    <button
                                                        key={frame.id}
                                                        onClick={() => setSelectedFrame(frame)}
                                                        className={`shrink-0 px-3.5 py-2.5 rounded-xl border-none transition-all text-xs font-bold flex items-center justify-center min-w-[70px] quran-raised-btn ${selectedFrame.id === frame.id ? 'quran-raised-btn-selected text-white' : ''}`}
                                                        style={{ 
                                                            color: selectedFrame.id === frame.id ? '#ffffff' : currentTheme.text,
                                                            backgroundColor: selectedFrame.id === frame.id ? (currentTheme.accent || '#1d4ed8') : currentTheme.bg
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
                                                <div className="flex items-center justify-between p-1.5 rounded-xl border-none quran-raised-card" style={{ backgroundColor: currentTheme.bg }}>
                                                    <button 
                                                        onClick={() => setFontSize(prev => Math.max(12, prev - 2))}
                                                        className="p-1.5 rounded-lg transition-all border-none quran-raised-btn"
                                                        style={{ color: currentTheme.text, backgroundColor: currentTheme.bg }}
                                                    >
                                                        <Minus size={14} className="quran-3d-icon" />
                                                    </button>
                                                    <span className="font-bold text-xs" style={{ color: currentTheme.text }}>{fontSize}</span>
                                                    <button 
                                                        onClick={() => setFontSize(prev => Math.min(48, prev + 2))}
                                                        className="p-1.5 rounded-lg transition-all border-none quran-raised-btn"
                                                        style={{ color: currentTheme.text, backgroundColor: currentTheme.bg }}
                                                    >
                                                        <Plus size={14} className="quran-3d-icon" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold mb-1 opacity-70">لون النص</label>
                                                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar p-2 rounded-xl border-none quran-raised-card items-center" style={{ backgroundColor: currentTheme.bg }}>
                                                    {TEXT_COLORS.map(color => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setTextColor(color)}
                                                            className={`w-6 h-6 rounded-full shrink-0 border-none transition-all quran-raised-btn ${textColor === color ? 'scale-115 quran-raised-btn-selected' : 'opacity-85'}`}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Font Selection */}
                                    {activeDesignTab === 'font' && (
                                        <div className="space-y-2 animate-fadeIn">
                                            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar p-1">
                                                {FONTS.map(font => (
                                                    <button
                                                        key={font.id}
                                                        onClick={() => setSelectedFont(font.id)}
                                                        className={`px-3.5 py-2.5 rounded-xl shrink-0 border-none transition-all text-xs font-bold quran-raised-btn ${selectedFont === font.id ? 'quran-raised-btn-selected' : ''}`}
                                                        style={{ 
                                                            fontFamily: font.id,
                                                            backgroundColor: selectedFont === font.id ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
                                                            color: selectedFont === font.id ? '#ffffff' : currentTheme.text
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
                                    className="w-full p-2.5 text-[11px] font-medium border-none rounded-xl outline-none transition-all shadow-inner bg-black/5 dark:bg-white/5"
                                    style={{ 
                                        color: currentTheme.text
                                    }}
                                    maxLength={50}
                                    dir="rtl"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div 
                        className="p-3 border-t flex gap-2 shrink-0 z-10" 
                        style={{ 
                            backgroundColor: currentTheme.bg, 
                            borderColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                            paddingBottom: 'calc(max(env(safe-area-inset-bottom, 0px), 56px) + 0.75rem)'
                        }}
                    >
                        <button
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 border-none quran-raised-btn"
                            style={{ 
                                backgroundColor: currentTheme.btnBg || (currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.08)' : '#ffffff'),
                                color: currentTheme.btnText || currentTheme.text
                            }}
                        >
                            رجوع
                        </button>
                        <button
                            onClick={handleCopy}
                            disabled={isCopying}
                            className="flex-1 py-3.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-70 border-none quran-raised-btn"
                            style={{ 
                                backgroundColor: currentTheme.text === '#ffffff' ? 'rgba(255,255,255,0.08)' : '#ffffff',
                                color: currentTheme.text
                            }}
                        >
                            {isCopying ? (
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <i className="fa-regular fa-copy quran-3d-icon"></i>
                                    نسخ
                                </>
                            )}
                        </button>
                        {shareType === 'image' && pageChunks.length > 1 ? (
                            <>
                                <button
                                    onClick={() => handleShare('current')}
                                    disabled={isSharing}
                                    className="flex-1 py-3.5 px-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-70 border-none quran-raised-btn quran-raised-btn-selected"
                                    style={{ backgroundColor: currentTheme.accent || '#3b82f6' }}
                                    title="مشاركة الصورة المعروضة حالياً فقط"
                                >
                                    {isSharing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Share2 size={15} className="quran-3d-icon" />
                                            <span>الحالية ({toArabic(safePageIndex + 1)})</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleShare('all')}
                                    disabled={isSharing}
                                    className="flex-1 py-3.5 px-2 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-70 border-none quran-raised-btn quran-raised-btn-selected"
                                    style={{ backgroundColor: currentTheme.accent || '#3b82f6' }}
                                    title={`مشاركة جميع الصور (${pageChunks.length})`}
                                >
                                    {isSharing ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <>
                                            <Images size={15} className="quran-3d-icon" />
                                            <span>الكل ({toArabic(pageChunks.length)})</span>
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                onClick={() => handleShare('all')}
                                disabled={isSharing}
                                className="flex-1 py-3.5 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-70 border-none quran-raised-btn quran-raised-btn-selected"
                                style={{ backgroundColor: currentTheme.accent || '#3b82f6' }}
                            >
                                {isSharing ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Share2 size={16} className="quran-3d-icon" />
                                        مشاركة
                                    </>
                                )}
                            </button>
                        )}
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
                                className="w-full py-3 rounded-xl font-bold text-white transition-all active:scale-95 border-none quran-raised-btn quran-raised-btn-selected"
                                style={{ backgroundColor: currentTheme.accent || '#16a34a' }}
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
                    style={{ backgroundColor: 'transparent' }}
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setRangeSelectorOpen(null);
                    }}
                >
                    <div 
                        className="w-[85%] max-w-[280px] flex flex-col max-h-[60vh] overflow-hidden rounded-2xl p-2.5 border-none shadow-2xl modal-skinned" 
                        style={{ backgroundColor: currentTheme.bg || '#ffffff' }} 
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex-1 overflow-y-auto px-1 py-1 space-y-2">
                            {quranData.surahs[currentAyah.s - 1].ayahs.map((ay: any) => {
                                const val = ay.numberInSurah;
                                const isSelected = rangeSelectorOpen === 'from' ? fromAyah === val : toAyah === val;
                                
                                return (
                                    <button 
                                        key={ay.numberInSurah}
                                         ref={isSelected ? selectedAyahRef : undefined}
                                        onClick={() => {
                                            if (rangeSelectorOpen === 'from') {
                                                setFromAyah(val);
                                                setToAyah(val);
                                            }
                                            else setToAyah(val);
                                            setRangeSelectorOpen(null);
                                        }}
                                        className={`w-full py-2 px-2 rounded-xl border-none flex flex-col items-center justify-center transition-all quran-raised-btn ${isSelected ? 'quran-raised-btn-selected' : ''}`}
                                        style={{ 
                                            backgroundColor: isSelected ? (currentTheme.accent || '#3b82f6') : currentTheme.bg,
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
