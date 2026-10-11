import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Play, Pause, Volume2, Type, Image as ImageIcon, 
  FileText, Palette, LayoutTemplate, Check, Share2, Copy, 
  Minus, Plus, CheckCircle2, Send, ArrowRight, Search
} from 'lucide-react';
import { safeHtml2Canvas, renderQuranCardToCanvas } from '../../utils/canvasHelper';
import { Share as CapacitorShare } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { QuranVerseAttachment } from '../../services/communityService';
import { quranData } from '../../utils/quranData';
import { FONTS, SURAH_NAMES_AR, toArabic } from '../QuranReader/constants';
import { renderTajweedTextHtml } from '../QuranReader/MushafPage';

interface QuranVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVerse: (verse: QuranVerseAttachment) => void;
}

const BACKGROUNDS = [
  { id: 'bg_white', type: 'solid', value: '#ffffff', border: '#e2e8f0', accent: '#0f172a', text: '#000000' },
  { id: 'bg_black', type: 'solid', value: '#0f172a', border: '#334155', accent: '#fbbf24', text: '#ffffff' },
  { id: 'bg_emerald_gold', type: 'gradient', value: 'linear-gradient(to bottom right, #064e3b, #0f766e)', border: '#34d399', accent: '#fbbf24', text: '#ffffff' },
  { id: 'bg_midnight_gold', type: 'gradient', value: 'linear-gradient(to bottom, #1e1b4b, #312e81)', border: '#818cf8', accent: '#fbbf24', text: '#ffffff' },
  { id: 'bg_royal', type: 'gradient', value: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)', border: '#c084fc', accent: '#fde047', text: '#ffffff' },
  { id: 'bg_maroon', type: 'gradient', value: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)', border: '#fca5a5', accent: '#fef08a', text: '#ffffff' },
  { id: 'bg_ocean', type: 'gradient', value: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 100%)', border: '#38bdf8', accent: '#f0f9ff', text: '#ffffff' },
  { id: 'bg_forest', type: 'gradient', value: 'radial-gradient(circle at top right, #14532d, #064e3b)', border: '#6ee7b7', accent: '#fde047', text: '#ffffff' },
  { id: 'bg_sand', type: 'gradient', value: 'linear-gradient(to right, #fef3c7, #fde68a)', border: '#d97706', accent: '#78350f', text: '#78350f' },
  { id: 'bg_sage', type: 'gradient', value: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)', border: '#059669', accent: '#064e3b', text: '#064e3b' },
  { id: 'bg_mesh_1', type: 'gradient', value: 'radial-gradient(at 0% 0%, #064e3b 0px, transparent 50%), radial-gradient(at 100% 100%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #0f766e, #312e81)', border: '#10b981', accent: '#fbbf24', text: '#ffffff' },
  { id: 'bg_mesh_2', type: 'gradient', value: 'radial-gradient(at 100% 0%, #7c2d12 0px, transparent 50%), radial-gradient(at 0% 100%, #4c1d95 0px, transparent 50%), linear-gradient(to right, #9a3412, #6b21a8)', border: '#fb923c', accent: '#fde047', text: '#ffffff' },
  { id: 'bg_mesh_3', type: 'gradient', value: 'radial-gradient(at 0% 100%, #831843 0px, transparent 50%), radial-gradient(at 100% 0%, #1e1b4b 0px, transparent 50%), linear-gradient(to right, #be185d, #4c1d95)', border: '#f472b6', accent: '#fbcfe8', text: '#ffffff' },
  { id: 'bg_pattern_1', type: 'pattern', value: 'repeating-linear-gradient(45deg, #0f172a, #0f172a 10px, #1e293b 10px, #1e293b 20px)', border: '#64748b', accent: '#fbbf24', text: '#ffffff' },
  { id: 'bg_pattern_2', type: 'pattern', value: 'repeating-radial-gradient(circle at 0 0, transparent 0, #064e3b 15px), repeating-linear-gradient(#022c22, #022c22)', border: '#10b981', accent: '#fef08a', text: '#ffffff' }
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
  { id: 'f10', name: 'كلاسيكي أبيض', type: 'classic-islamic', color: '#ffffff' }
];

export const FrameOverlay = ({ frame, scale = 1 }: { frame: typeof FRAMES[0], scale?: number }) => {
  if (!frame || frame.type === 'none') return null;
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
  '#000000', '#ffffff', '#f1c40f', '#e74c3c', '#2ecc71', '#3498db',
  '#9b59b6', '#e67e22', '#1abc9c', '#ecf0f1', '#95a5a6', '#34495e',
  '#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb', '#1dd1a1', '#5f27cd'
];

const normalizeArabic = (text: string) => {
  if (!text) return '';
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي');
};

interface QuranIndexItem {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
  page: number;
  juz: number;
}

const ALL_QURAN_AYAHS: QuranIndexItem[] = [];
quranData.surahs.forEach((s: any) => {
  s.ayahs.forEach((ay: any) => {
    ALL_QURAN_AYAHS.push({
      surahNumber: s.number,
      surahName: s.name,
      ayahNumber: ay.numberInSurah,
      text: ay.text,
      page: ay.page || 1,
      juz: ay.juz || 1
    });
  });
});

const QUICK_SUGGESTIONS = [
  { label: 'سورة الفاتحة', surah: 1, ayah: 1 },
  { label: 'آية الكرسي', surah: 2, ayah: 255 },
  { label: 'خواتيم البقرة', surah: 2, ayah: 285 },
  { label: 'سورة الكهف', surah: 18, ayah: 1 },
  { label: 'سورة يس', surah: 36, ayah: 1 },
  { label: 'سورة الرحمن', surah: 55, ayah: 1 },
  { label: 'سورة الملك', surah: 67, ayah: 1 },
  { label: 'سورة الإخلاص', surah: 112, ayah: 1 },
];

const QuranVerseModal: React.FC<QuranVerseModalProps> = ({ isOpen, onClose, onSendVerse }) => {
  const [step, setStep] = useState<'search' | 'customize'>('search');
  const [quranSearchQuery, setQuranSearchQuery] = useState('');
  const [browseSurah, setBrowseSurah] = useState<number>(1);
  const [searchMode, setSearchMode] = useState<'search' | 'browse'>('search');

  const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>('page');
  const [selectedSurah, setSelectedSurah] = useState<number>(1);
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);
  
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[8]); // Default amber/sand background
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [fontSize, setFontSize] = useState(20);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [selectedFont, setSelectedFont] = useState(FONTS[0].id);
  const [activeTab, setActiveTab] = useState<'bg' | 'frame' | 'text' | 'font' | null>(null);
  const [rangeSelectorOpen, setRangeSelectorOpen] = useState<'from' | 'to' | null>(null);
  const [searchSurahQuery, setSearchSurahQuery] = useState('');
  const [customText, setCustomText] = useState('');
  
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset to search step on open, default to direct search results tab
  useEffect(() => {
    if (isOpen) {
      setStep('search');
      setQuranSearchQuery('');
      setSearchMode('search');
    }
  }, [isOpen]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const getSurahName = (s: number) => {
    return SURAH_NAMES_AR[s - 1] || '';
  };

  // Live Quran Search Results
  const searchResults = useMemo(() => {
    const q = normalizeArabic(quranSearchQuery.trim().toLowerCase());
    if (!q) return [];
    const results: QuranIndexItem[] = [];
    for (const item of ALL_QURAN_AYAHS) {
      const normText = normalizeArabic(item.text);
      const normSurah = normalizeArabic(item.surahName);
      if (normText.includes(q) || normSurah.includes(q)) {
        results.push(item);
        if (results.length >= 60) break;
      }
    }
    return results;
  }, [quranSearchQuery]);

  const handleSelectAyahForCustomization = (surahNum: number, ayahNum: number) => {
    setSelectedSurah(surahNum);
    setFromAyah(ayahNum);
    setToAyah(ayahNum);
    setStep('customize');
  };

  const currentSurahObj = useMemo(() => {
    return quranData.surahs.find(s => s.number === selectedSurah) || quranData.surahs[0];
  }, [selectedSurah]);

  const maxAyahsInSurah = currentSurahObj?.ayahs?.length || 1;

  // Selected ayahs list
  const selectedAyahs = useMemo(() => {
    const start = Math.min(fromAyah, toAyah);
    const end = Math.max(fromAyah, toAyah);
    const list: { s: number; a: number; text: string }[] = [];
    for (let a = start; a <= end; a++) {
      const ayah = currentSurahObj?.ayahs?.find((ay: any) => ay.numberInSurah === a);
      if (ayah) {
        list.push({ s: selectedSurah, a, text: ayah.text });
      }
    }
    return list;
  }, [currentSurahObj, fromAyah, toAyah, selectedSurah]);

  // Page info
  const firstSelectedAyahObj = currentSurahObj?.ayahs?.find((ay: any) => ay.numberInSurah === Math.min(fromAyah, toAyah));
  const pageNum = firstSelectedAyahObj?.page || 1;

  // All ayahs in this entire page
  const pageAyahs = useMemo(() => {
    const list: { sNum: number; sName: string; numberInSurah: number; text: string }[] = [];
    quranData.surahs.forEach((s: any, sIdx: number) => {
      s.ayahs.forEach((ay: any) => {
        if (ay.page === pageNum) {
          list.push({
            sNum: sIdx + 1,
            sName: s.name,
            numberInSurah: ay.numberInSurah,
            text: ay.text
          });
        }
      });
    });
    return list;
  }, [pageNum]);

  // Audio URL for selected ayah
  const firstGlobalAyahNumber = firstSelectedAyahObj?.number || 1;
  const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${firstGlobalAyahNumber}.mp3`;

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
        audioObj.src = '';
      }
    };
  }, [audioObj]);

  const toggleAudioPlayback = () => {
    if (isPlayingAudio) {
      audioObj?.pause();
      setIsPlayingAudio(false);
    } else {
      const sound = new Audio(audioUrl);
      sound.onended = () => setIsPlayingAudio(false);
      sound.play().catch(() => {});
      setAudioObj(sound);
      setIsPlayingAudio(true);
    }
  };

  const getCombinedAyahsText = () => {
    return selectedAyahs.map(ay => `${ay.text} ﴿${toArabic(ay.a)}﴾`).join(' ');
  };

  const getCombinedPageText = () => {
    return pageAyahs.map(ay => `${ay.text} ﴿${toArabic(ay.numberInSurah)}﴾`).join(' ');
  };

  const handleCopy = async () => {
    if (shareType === 'text') {
      const textToCopy = `﴿ ${getCombinedAyahsText()} ﴾\nسورة ${getSurahName(selectedSurah)} (الآيات ${toArabic(fromAyah)} إلى ${toArabic(toAyah)})\nمصحف أحمد وليلى`;
      await navigator.clipboard.writeText(textToCopy);
      showToast('تم نسخ نص الآية بنجاح 📋');
    } else if (previewCardRef.current) {
      try {
        const canvas = await safeHtml2Canvas(previewCardRef.current, { scale: 2, useCORS: true });
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && (window as any).ClipboardItem) {
            await navigator.clipboard.write([new (window as any).ClipboardItem({ 'image/png': blob })]);
            showToast('تم نسخ صورة البطاقة بنجاح 🖼️');
          } else {
            const textToCopy = `﴿ ${getCombinedAyahsText()} ﴾\nسورة ${getSurahName(selectedSurah)}\nمصحف أحمد وليلى`;
            await navigator.clipboard.writeText(textToCopy);
            showToast('تم نسخ النص بنجاح 📋');
          }
        });
      } catch (e) {
        showToast('تم نسخ النص بنجاح 📋');
      }
    }
  };

  const handleExternalShare = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const shareTitle = `سورة ${getSurahName(selectedSurah)}`;
    const shareText = `﴿ ${shareType === 'page' ? getCombinedPageText() : getCombinedAyahsText()} ﴾\nسورة ${getSurahName(selectedSurah)} (الآية ${toArabic(fromAyah)})\nمصحف أحمد وليلى`;

    try {
      if (shareType === 'audio') {
        if (navigator.share) {
          await navigator.share({ title: shareTitle, text: shareText, url: audioUrl });
        } else {
          await navigator.clipboard.writeText(shareText + '\n' + audioUrl);
          showToast('تم نسخ رابط التلاوة 🎵');
        }
      } else if (shareType === 'text') {
        if (navigator.share) {
          await navigator.share({ title: shareTitle, text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          showToast('تم نسخ النص 📋');
        }
      } else {
        let dataUrl = '';
        try {
          if (previewCardRef.current) {
            const canvas = await safeHtml2Canvas(previewCardRef.current, { scale: 2, useCORS: true });
            dataUrl = canvas.toDataURL('image/png');
          }
        } catch (e) {
          console.warn('DOM share capture failed:', e);
        }

        if (!dataUrl || dataUrl === 'data:,') {
          const fallbackAttachment: QuranVerseAttachment = {
            surahName: getSurahName(selectedSurah),
            surahNumber: selectedSurah,
            ayahNumber: fromAyah,
            fromAyah,
            toAyah,
            text: shareType === 'page' ? getCombinedPageText() : getCombinedAyahsText(),
            shareType,
            bgValue: selectedBg.value,
            textColor,
            frameType: selectedFrame.type,
            frameColor: selectedFrame.color,
            fontSize
          };
          const fallbackCanvas = renderQuranCardToCanvas(fallbackAttachment);
          dataUrl = fallbackCanvas.toDataURL('image/png');
        }

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `quran_share_${selectedSurah}_${fromAyah}.png`, { type: 'image/png' });

        if (Capacitor.isNativePlatform()) {
          await CapacitorShare.share({ title: shareTitle, text: shareText, dialogTitle: 'مشاركة عبر' });
        } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({ title: shareTitle, text: shareText, files: [file] });
        } else if (navigator.share) {
          await navigator.share({ title: shareTitle, text: shareText });
        } else {
          await navigator.clipboard.writeText(shareText);
          showToast('تم نسخ النص للمشاركة 📋');
        }
      }
    } catch (err) {
      console.log('External share cancelled or failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendToChat = () => {
    const attachment: QuranVerseAttachment = {
      surahName: getSurahName(selectedSurah),
      surahNumber: selectedSurah,
      ayahNumber: fromAyah,
      fromAyah,
      toAyah,
      text: shareType === 'page' ? getCombinedPageText() : getCombinedAyahsText(),
      audioUrl: audioUrl,
      shareType,
      pageNumber: pageNum,
      fullPageText: getCombinedPageText(),
      reciterName: 'الشيخ مشاري العفاسي',
      bgValue: selectedBg.value,
      bgType: selectedBg.type,
      border: selectedBg.border,
      accent: selectedBg.accent,
      frameType: selectedFrame.type,
      frameColor: selectedFrame.color,
      textColor,
      fontSize,
      fontFamily: selectedFont,
      customNote: customText.trim()
    };

    onSendVerse(attachment);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4" dir="rtl">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 15 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh] relative"
        >
          {/* Toast message popup */}
          {toastMsg && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-slate-900/95 text-emerald-400 text-xs font-bold px-4 py-1.5 rounded-full shadow-xl border border-emerald-500/40 z-50 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 size={15} />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1: QURAN SEARCH & AYAH SELECTION                                    */}
          {/* ========================================================================= */}
          {step === 'search' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/90">
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  <span>البحث في القرآن الكريم واختيار آية</span>
                </h3>
                <div className="w-6" />
              </div>

              {/* Search Bar Input */}
              <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
                <div className="relative">
                  <Search size={18} className="absolute right-3.5 top-3 text-emerald-600 dark:text-emerald-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={quranSearchQuery}
                    onChange={(e) => setQuranSearchQuery(e.target.value)}
                    placeholder="ابحث بالكلمة، الآية، أو اسم السورة..."
                    className="w-full pr-10 pl-9 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  {quranSearchQuery && (
                    <button
                      onClick={() => setQuranSearchQuery('')}
                      className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>

                {/* Sub-modes: بحث حر / تصفح حسب السورة */}
                <div className="flex items-center gap-2 mt-2.5">
                  <button
                    onClick={() => setSearchMode('search')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      searchMode === 'search'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    نتائج البحث المباشر {quranSearchQuery ? `(${searchResults.length})` : ''}
                  </button>
                  <button
                    onClick={() => setSearchMode('browse')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                      searchMode === 'browse'
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    تصفح السور والآيات
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {searchMode === 'search' && (
                  <>
                    {quranSearchQuery.trim() === '' ? (
                      <div>
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 px-1">
                          <span>آيات وسور مقترحة ومباركة:</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {QUICK_SUGGESTIONS.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSelectAyahForCustomization(item.surah, item.ayah)}
                              className="p-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/40 rounded-2xl text-center text-xs font-bold text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center active:scale-98"
                            >
                              <span>{item.label}</span>
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-center text-slate-400 dark:text-slate-500 mt-4">
                          اكتب أي كلمة أو جزء من آية في شريط البحث أعلاه للبحث في كامل المصحف الشريف
                        </p>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-12">
                        <Search size={36} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                          لم يتم العثور على آيات مطابقة لـ "{quranSearchQuery}"
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          تأكد من كتابة الكلمة بشكل صحيح أو جرب كلمة أخرى
                        </p>
                      </div>
                    ) : (
                      searchResults.map((res) => (
                        <div
                          key={`${res.surahNumber}_${res.ayahNumber}`}
                          onClick={() => handleSelectAyahForCustomization(res.surahNumber, res.ayahNumber)}
                          className="p-3 bg-white dark:bg-slate-800/90 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 rounded-2xl cursor-pointer transition-all active:scale-[0.99] shadow-sm group"
                        >
                          <div className="flex items-center justify-between mb-1.5 text-xs">
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-600">
                              سورة {res.surahName} - الآية {toArabic(res.ayahNumber)}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-2 py-0.5 rounded-full">
                              صـ {toArabic(res.page)} • جـ {toArabic(res.juz)}
                            </span>
                          </div>
                          <p 
                            className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-arabic"
                            style={{ fontFamily: 'amiri' }}
                          >
                            ﴿ {res.text} ﴾
                          </p>
                        </div>
                      ))
                    )}
                  </>
                )}

                {searchMode === 'browse' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Surah List */}
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      <span className="text-xs font-bold text-slate-400 sticky top-0 bg-white dark:bg-slate-900 py-1 block">
                        اختر السورة:
                      </span>
                      {quranData.surahs.map(s => (
                        <button
                          key={s.number}
                          onClick={() => setBrowseSurah(s.number)}
                          className={`w-full text-right p-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all ${
                            browseSurah === s.number
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <span>{s.number}. سورة {s.name}</span>
                          <span className={`text-[10px] ${browseSurah === s.number ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {toArabic(s.ayahs.length)} آية
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Ayahs of chosen Surah */}
                    <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                      <span className="text-xs font-bold text-slate-400 sticky top-0 bg-white dark:bg-slate-900 py-1 block">
                        اختر رقم الآية من سورة {getSurahName(browseSurah)}:
                      </span>
                      <div className="grid grid-cols-5 gap-1.5">
                        {Array.from({ length: quranData.surahs.find(s => s.number === browseSurah)?.ayahs.length || 1 }, (_, i) => i + 1).map(aNum => (
                          <button
                            key={aNum}
                            onClick={() => handleSelectAyahForCustomization(browseSurah, aNum)}
                            className="py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-800 dark:text-slate-200 transition-colors shadow-sm active:scale-95"
                          >
                            {toArabic(aNum)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: SHARE CARD CUSTOMIZATION VIEW                                     */}
          {/* ========================================================================= */}
          {step === 'customize' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Header */}
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50 dark:bg-slate-900/90">
                <button
                  onClick={() => setStep('search')}
                  className="px-2.5 py-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowRight size={14} />
                  <span>تغيير الآية</span>
                </button>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FileText size={16} />
                  <span>خيارات المشاركة (سورة {getSurahName(selectedSurah)})</span>
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Share Type Selector */}
              <div className="p-3 pb-2 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => setShareType('text')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      shareType === 'text'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Type size={14} />
                    <span>نص</span>
                  </button>

                  <button
                    onClick={() => setShareType('image')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      shareType === 'image'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ImageIcon size={14} />
                    <span>صورة</span>
                  </button>

                  <button
                    onClick={() => setShareType('page')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      shareType === 'page'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText size={14} />
                    <span>صفحة</span>
                  </button>

                  <button
                    onClick={() => setShareType('audio')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                      shareType === 'audio'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Volume2 size={14} />
                    <span>صوت</span>
                  </button>
                </div>

                {/* Range Selector: من و إلى */}
                <div className="flex justify-between items-center gap-3 mt-3">
                  <div className="flex-1">
                    <label className="block text-[10px] text-center mb-1 font-bold text-slate-500 dark:text-slate-400">من</label>
                    <button
                      onClick={() => setRangeSelectorOpen('from')}
                      className="w-full py-2 px-3 text-xs font-bold border-2 border-emerald-500/40 hover:border-emerald-500 rounded-2xl text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm active:scale-98 transition-all"
                    >
                      سورة {getSurahName(selectedSurah)} (الآية {toArabic(fromAyah)})
                    </button>
                  </div>

                  <div className="flex-1">
                    <label className="block text-[10px] text-center mb-1 font-bold text-slate-500 dark:text-slate-400">إلى</label>
                    <button
                      onClick={() => setRangeSelectorOpen('to')}
                      className="w-full py-2 px-3 text-xs font-bold border-2 border-emerald-500/40 hover:border-emerald-500 rounded-2xl text-center bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm active:scale-98 transition-all"
                    >
                      سورة {getSurahName(selectedSurah)} (الآية {toArabic(toAyah)})
                    </button>
                  </div>
                </div>
              </div>

          {/* Range Picker Modal (Surah & Ayah selection) */}
          <AnimatePresence>
            {rangeSelectorOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="absolute inset-0 bg-white dark:bg-slate-900 z-40 p-4 flex flex-col rounded-3xl"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    اختر السورة والآية ({rangeSelectorOpen === 'from' ? 'من' : 'إلى'})
                  </span>
                  <button
                    onClick={() => setRangeSelectorOpen(null)}
                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="relative mb-3">
                  <Search size={16} className="absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={searchSurahQuery}
                    onChange={(e) => setSearchSurahQuery(e.target.value)}
                    placeholder="ابحث عن اسم السورة..."
                    className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
                  {/* Surahs Column */}
                  <div className="overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 px-2 py-1 sticky top-0 bg-white dark:bg-slate-900">السورة</span>
                    {quranData.surahs
                      .filter(s => normalizeArabic(s.name).includes(normalizeArabic(searchSurahQuery)))
                      .map(s => (
                        <button
                          key={s.number}
                          onClick={() => {
                            setSelectedSurah(s.number);
                            setFromAyah(1);
                            setToAyah(1);
                          }}
                          className={`w-full text-right px-2.5 py-2 rounded-lg text-xs font-bold transition-all ${
                            selectedSurah === s.number
                              ? 'bg-emerald-600 text-white'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {s.number}. سورة {s.name}
                        </button>
                      ))}
                  </div>

                  {/* Ayahs Column */}
                  <div className="overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-1.5 space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 px-2 py-1 sticky top-0 bg-white dark:bg-slate-900">الآية</span>
                    {Array.from({ length: maxAyahsInSurah }, (_, idx) => idx + 1).map(aNum => (
                      <button
                        key={aNum}
                        onClick={() => {
                          if (rangeSelectorOpen === 'from') {
                            setFromAyah(aNum);
                            if (aNum > toAyah) setToAyah(aNum);
                          } else {
                            setToAyah(aNum);
                            if (aNum < fromAyah) setFromAyah(aNum);
                          }
                          setRangeSelectorOpen(null);
                        }}
                        className={`w-full text-center px-2 py-2 rounded-lg text-xs font-bold transition-all ${
                          (rangeSelectorOpen === 'from' ? fromAyah === aNum : toAyah === aNum)
                            ? 'bg-emerald-600 text-white'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        الآية {toArabic(aNum)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2">
                  <button
                    onClick={() => setRangeSelectorOpen(null)}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                  >
                    تأكيد الاختيار
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Live Preview Area */}
          <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-100/60 dark:bg-slate-950/40 min-h-[260px]">
            <div className="w-full flex justify-center">
              <div
                ref={previewCardRef}
                style={{
                  position: 'relative',
                  width: '100%',
                  maxWidth: '440px',
                  minHeight: '220px',
                  borderRadius: '24px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '24px 20px',
                  textAlign: 'center',
                  backgroundColor: selectedBg.type === 'solid' ? selectedBg.value : undefined,
                  backgroundImage: selectedBg.type !== 'solid' ? selectedBg.value : undefined,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: `3px solid ${selectedBg.border}`
                }}
                className="shadow-xl"
              >
                {/* Frame Overlay */}
                <FrameOverlay frame={selectedFrame} />

                {/* Tag Indicators */}
                {shareType === 'page' && (
                  <div className="mb-2 text-center">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                      صفحة مصحف مباركة - سورة {getSurahName(selectedSurah)} ({fromAyah === toAyah ? `الآية ${toArabic(fromAyah)}` : `الآيات ${toArabic(fromAyah)} إلى ${toArabic(toAyah)}`})
                    </span>
                    <div className="w-24 h-0.5 bg-amber-600/30 mx-auto my-1.5" />
                  </div>
                )}

                {shareType === 'text' && (
                  <div className="mb-2 bg-slate-500/10 border border-slate-400/30 py-1 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    <Type size={13} />
                    <span>مشاركة النص فقط</span>
                  </div>
                )}

                {shareType === 'audio' && (
                  <div className="mb-2 bg-blue-500/10 border border-blue-400/30 py-1 px-3 rounded-full flex items-center gap-1.5 text-[11px] font-bold text-blue-800 dark:text-blue-300">
                    <Volume2 size={13} />
                    <span>مشاركة تلاوة صوتية</span>
                  </div>
                )}

                {/* Basmalah for Image mode */}
                {shareType === 'image' && (
                  <p
                    style={{
                      fontFamily: 'var(--font-amiri-quran), var(--font-hafs), serif',
                      fontSize: `${fontSize * 1.15}px`,
                      color: selectedBg.accent || textColor,
                      marginBottom: '10px',
                      fontWeight: 'bold'
                    }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                )}

                {/* Verse Text with Brackets */}
                <p
                  className="share-preview-text px-2"
                  style={{
                    lineHeight: '2.1',
                    fontFamily: selectedFont,
                    fontSize: `${fontSize * 1.1}px`,
                    color: textColor,
                    margin: 0,
                    fontWeight: 'bold',
                    whiteSpace: 'normal',
                    wordBreak: 'keep-all',
                    textAlign: 'center'
                  }}
                >
                  {selectedAyahs.map((ay, idx) => (
                    <React.Fragment key={idx}>
                      <span dangerouslySetInnerHTML={{ __html: renderTajweedTextHtml(ay.text) }} />
                      {` ﴿${toArabic(ay.a)}﴾ `}
                    </React.Fragment>
                  ))}
                </p>

                {/* Audio Player Action inside Preview */}
                {shareType === 'audio' && (
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={toggleAudioPlayback}
                      className="p-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-transform active:scale-95 flex items-center gap-1 text-xs font-bold"
                    >
                      {isPlayingAudio ? <Pause size={16} /> : <Play size={16} />}
                      <span>{isPlayingAudio ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}</span>
                    </button>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      بصوت الشيخ مشاري العفاسي 🎙️
                    </span>
                  </div>
                )}

                {/* Custom Note if any */}
                {customText.trim() && (
                  <p
                    style={{
                      fontSize: `${fontSize * 0.75}px`,
                      color: textColor,
                      opacity: 0.9,
                      marginTop: '8px',
                      fontStyle: 'italic'
                    }}
                  >
                    "{customText}"
                  </p>
                )}

                {/* Watermark at bottom */}
                <div className="mt-3 pt-2 border-t border-black/10 dark:border-white/10 w-full text-center">
                  <span
                    style={{
                      fontFamily: 'var(--font-lateef), serif',
                      fontSize: '14px',
                      color: textColor,
                      opacity: 0.75,
                      fontWeight: 'bold'
                    }}
                  >
                    {shareType === 'page' ? 'مصحف احمد وليلي • صفحة قراءة تلاوة' : 'مصحف احمد وليلي'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Customization Toolbar Options */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            {/* 4 Customization Buttons */}
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setActiveTab(activeTab === 'bg' ? null : 'bg')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'bg'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Palette size={14} />
                <span>الخلفية</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'frame' ? null : 'frame')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'frame'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <LayoutTemplate size={14} />
                <span>الإطار</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'text' ? null : 'text')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'text'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Palette size={14} />
                <span>النص</span>
              </button>

              <button
                onClick={() => setActiveTab(activeTab === 'font' ? null : 'font')}
                className={`py-2 px-1 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                  activeTab === 'font'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Type size={14} />
                <span>الخط</span>
              </button>
            </div>

            {/* Sub-panels for active customization tab */}
            <AnimatePresence>
              {activeTab === 'bg' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto py-2 px-1">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        onClick={() => {
                          setSelectedBg(bg);
                          if (bg.text) setTextColor(bg.text);
                        }}
                        style={{
                          background: bg.value,
                          border: `2px solid ${selectedBg.id === bg.id ? '#10b981' : bg.border}`
                        }}
                        className={`w-10 h-10 rounded-xl flex-shrink-0 shadow-sm transition-transform active:scale-95 ${
                          selectedBg.id === bg.id ? 'ring-2 ring-emerald-500 scale-105' : ''
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'frame' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto py-2 px-1">
                    {FRAMES.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFrame(f)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                          selectedFrame.id === f.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'text' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-2 py-1"
                >
                  {/* Font size + / - */}
                  <div className="flex items-center justify-between px-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-xl">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">حجم الخط:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 active:scale-95"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-xs font-bold w-6 text-center">{fontSize}</span>
                      <button
                        onClick={() => setFontSize(prev => Math.min(36, prev + 2))}
                        className="p-1 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 active:scale-95"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Colors palette */}
                  <div className="flex gap-2 overflow-x-auto py-1 px-1">
                    {TEXT_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => setTextColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full flex-shrink-0 border border-slate-300 dark:border-slate-600 ${
                          textColor === c ? 'ring-2 ring-emerald-500 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'font' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-2 overflow-x-auto py-2 px-1">
                    {FONTS.map((font) => (
                      <button
                        key={font.id}
                        onClick={() => setSelectedFont(font.id)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold whitespace-nowrap transition-all ${
                          selectedFont === font.id
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Optional extra text input */}
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="نص إضافي (اختياري)..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
            />

            {/* Bottom 3 Action Buttons in Chat */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                onClick={() => setStep('search')}
                className="py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all text-center"
              >
                رجوع
              </button>

              <button
                onClick={handleCopy}
                className="py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1"
              >
                <Copy size={14} />
                <span>نسخ</span>
              </button>

              <button
                onClick={handleSendToChat}
                className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20 active:scale-95"
              >
                <Send size={14} className="rotate-180" />
                <span>إرسال</span>
              </button>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default QuranVerseModal;
