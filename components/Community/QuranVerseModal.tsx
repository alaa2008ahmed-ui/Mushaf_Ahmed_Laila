import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, BookOpen, Send, X, Play, Pause, Volume2, 
  ArrowRight, Type, Image as ImageIcon, FileText, Palette, Check, Sparkles,
  Share2, Copy, Minus, Plus, CheckCircle2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { safeHtml2Canvas } from '../../utils/canvasHelper';
import { Share as CapacitorShare } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { QuranVerseAttachment } from '../../services/communityService';
import { quranData } from '../../utils/quranData';

interface QuranVerseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVerse: (verse: QuranVerseAttachment) => void;
}

const BACKGROUNDS = [
  { id: 'bg_white', name: 'أبيض', type: 'solid', value: '#ffffff', border: '#e2e8f0', text: '#000000', accent: '#059669' },
  { id: 'bg_black', name: 'أسود', type: 'solid', value: '#0f172a', border: '#334155', text: '#ffffff', accent: '#fbbf24' },
  { id: 'bg_emerald_gold', name: 'زمرد وذهب', type: 'gradient', value: 'linear-gradient(to bottom right, #064e3b, #0f766e)', border: '#34d399', text: '#ffffff', accent: '#fbbf24' },
  { id: 'bg_midnight_gold', name: 'ليل ملكي', type: 'gradient', value: 'linear-gradient(to bottom, #1e1b4b, #312e81)', border: '#818cf8', text: '#ffffff', accent: '#fbbf24' },
  { id: 'bg_royal', name: 'بنفسجي ملكي', type: 'gradient', value: 'linear-gradient(135deg, #4c1d95 0%, #7e22ce 100%)', border: '#c084fc', text: '#ffffff', accent: '#fde047' },
  { id: 'bg_sand', name: 'عنبري', type: 'gradient', value: 'linear-gradient(to right, #fef3c7, #fde68a)', border: '#d97706', text: '#78350f', accent: '#b45309' },
  { id: 'bg_sage', name: 'نعناعي', type: 'gradient', value: 'linear-gradient(to bottom right, #ecfdf5, #d1fae5)', border: '#059669', text: '#064e3b', accent: '#047857' }
];

const FRAMES = [
  { id: 'none', name: 'بدون إطار', type: 'none', color: 'transparent' },
  { id: 'double_gold', name: 'مزدوج ذهبي', type: 'double', color: '#FFD700' },
  { id: 'double_emerald', name: 'مزدوج زمردي', type: 'double', color: '#059669' },
  { id: 'mihrab', name: 'محراب إسلامي', type: 'mihrab', color: '#FFD700' },
  { id: 'elegant', name: 'أنيق مضاعف', type: 'elegant', color: '#3b82f6' }
];

const TEXT_COLORS = [
  '#000000', '#ffffff', '#059669', '#d97706', '#b91c1c', '#1d4ed8', '#6b21a8'
];

const FONTS = [
  { id: 'amiri', name: 'خط الأميري', className: 'font-serif' },
  { id: 'system', name: 'خط عادي', className: 'font-sans' }
];

const normalizeArabic = (text: string) => {
  if (!text) return '';
  return text
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي');
};

const toArabicDigits = (str: number | string) => {
  return String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

const FrameOverlay: React.FC<{ frame: typeof FRAMES[0] }> = ({ frame }) => {
  if (frame.type === 'none') return null;
  const color = frame.color;

  if (frame.type === 'double') {
    return (
      <div 
        className="absolute inset-2 border-2 pointer-events-none rounded-xl z-10"
        style={{ borderStyle: 'double', borderColor: color, borderWidth: '3px' }}
      />
    );
  }

  if (frame.type === 'mihrab') {
    return (
      <div 
        className="absolute inset-2 border-2 pointer-events-none rounded-t-full rounded-b-xl z-10"
        style={{ borderColor: color }}
      />
    );
  }

  if (frame.type === 'elegant') {
    return (
      <div className="absolute inset-2 border pointer-events-none rounded-xl z-10" style={{ borderColor: color }}>
        <div className="absolute inset-1 border opacity-50 rounded-lg" style={{ borderColor: color }} />
      </div>
    );
  }

  return null;
};

const QuranVerseModal: React.FC<QuranVerseModalProps> = ({ isOpen, onClose, onSendVerse }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerseRef, setSelectedVerseRef] = useState<{ surahNumber: number; ayahNumber: number } | null>(null);
  
  // Range states ("من" and "إلى")
  const [fromAyah, setFromAyah] = useState<number>(1);
  const [toAyah, setToAyah] = useState<number>(1);
  const [rangeSelectorOpen, setRangeSelectorOpen] = useState<'from' | 'to' | null>(null);

  // Customization states
  const [shareType, setShareType] = useState<'text' | 'image' | 'page' | 'audio'>('image');
  const [selectedBg, setSelectedBg] = useState(BACKGROUNDS[0]);
  const [selectedFrame, setSelectedFrame] = useState(FRAMES[0]);
  const [textColor, setTextColor] = useState(TEXT_COLORS[0]);
  const [fontSize, setFontSize] = useState(20);
  const [selectedFont, setSelectedFont] = useState(FONTS[0]);
  const [activeTab, setActiveTab] = useState<'bg' | 'frame' | 'text' | 'font' | null>(null);
  const [customNote, setCustomNote] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isProcessingShare, setIsProcessingShare] = useState(false);

  // Audio player state
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  const previewCardRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2500);
  };

  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return [];
    const norm = normalizeArabic(searchQuery.trim().toLowerCase());

    const results: { surahName: string; surahNumber: number; ayahNumber: number; text: string; audioUrl?: string }[] = [];

    for (const surah of quranData.surahs) {
      const matchSurahName = normalizeArabic(surah.name).includes(norm);

      for (const ayah of surah.ayahs) {
        const normAyahText = normalizeArabic(ayah.text);
        if (matchSurahName || normAyahText.includes(norm)) {
          results.push({
            surahName: surah.name,
            surahNumber: surah.number,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text,
            audioUrl: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`
          });
          if (results.length >= 40) break;
        }
      }
      if (results.length >= 40) break;
    }

    return results;
  }, [searchQuery]);

  const currentSurah = useMemo(() => {
    if (!selectedVerseRef) return null;
    return quranData.surahs.find(s => s.number === selectedVerseRef.surahNumber) || null;
  }, [selectedVerseRef]);

  // When selecting a verse, update from/to
  const handleSelectVerseRef = (ref: { surahNumber: number; ayahNumber: number }) => {
    setSelectedVerseRef(ref);
    setFromAyah(ref.ayahNumber);
    setToAyah(ref.ayahNumber);
  };

  const startAyahNum = Math.min(fromAyah, toAyah);
  const endAyahNum = Math.max(fromAyah, toAyah);

  const selectedAyahs = useMemo(() => {
    if (!currentSurah) return [];
    return currentSurah.ayahs.filter(a => a.numberInSurah >= startAyahNum && a.numberInSurah <= endAyahNum);
  }, [currentSurah, startAyahNum, endAyahNum]);

  const combinedText = useMemo(() => {
    if (!selectedAyahs.length) return '';
    return selectedAyahs.map(a => `${a.text} ﴿${toArabicDigits(a.numberInSurah)}﴾`).join(' ');
  }, [selectedAyahs]);

  const currentSelectedVerse = useMemo(() => {
    if (!selectedVerseRef || !currentSurah) return null;
    const firstAyah = currentSurah.ayahs.find(a => a.numberInSurah === startAyahNum);
    return {
      surahName: currentSurah.name,
      surahNumber: currentSurah.number,
      startAyah: startAyahNum,
      endAyah: endAyahNum,
      text: combinedText,
      audioUrl: firstAyah ? `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${firstAyah.number}.mp3` : undefined
    };
  }, [selectedVerseRef, currentSurah, startAyahNum, endAyahNum, combinedText]);

  if (!isOpen) return null;

  const handleCopyText = () => {
    if (!currentSelectedVerse) return;
    const shareText = `﴿ ${combinedText} ﴾\n\nسورة ${currentSelectedVerse.surahName} (${startAyahNum === endAyahNum ? `الآية ${toArabicDigits(startAyahNum)}` : `الآيات ${toArabicDigits(startAyahNum)} إلى ${toArabicDigits(endAyahNum)}`})\nمصحف احمد وليلي`;
    navigator.clipboard.writeText(shareText);
    showToast('تم نسخ نص الآية بنجاح 📋');
  };

  const handleShareToApps = async () => {
    if (!currentSelectedVerse || isProcessingShare) return;
    setIsProcessingShare(true);

    const surahRangeLabel = startAyahNum === endAyahNum 
      ? `سورة ${currentSelectedVerse.surahName} (آية ${toArabicDigits(startAyahNum)})`
      : `سورة ${currentSelectedVerse.surahName} (الآيات ${toArabicDigits(startAyahNum)} إلى ${toArabicDigits(endAyahNum)})`;

    const textToShare = `﴿ ${combinedText} ﴾\n\n${surahRangeLabel}\nمصحف احمد وليلي`;

    try {
      if (shareType === 'audio' && currentSelectedVerse.audioUrl) {
        if (navigator.share) {
          await navigator.share({
            title: surahRangeLabel,
            text: textToShare,
            url: currentSelectedVerse.audioUrl
          });
        } else {
          navigator.clipboard.writeText(textToShare);
          showToast('تم نسخ التلاوة الصوتية والنص للمشاركة 🎵');
        }
      } else if (previewCardRef.current) {
        // Capture as PNG image using safeHtml2Canvas
        const canvas = await safeHtml2Canvas(previewCardRef.current, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false
        });

        const dataUrl = canvas.toDataURL('image/png');
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `quran_verse_${currentSelectedVerse.surahNumber}.png`, { type: 'image/png' });

        if (Capacitor.isNativePlatform()) {
          await CapacitorShare.share({
            title: surahRangeLabel,
            text: textToShare,
            dialogTitle: 'مشاركة الآية عبر'
          });
        } else if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: surahRangeLabel,
            text: textToShare,
            files: [file]
          });
        } else if (navigator.share) {
          await navigator.share({
            title: surahRangeLabel,
            text: textToShare
          });
        } else {
          navigator.clipboard.writeText(textToShare);
          showToast('تم فتح تجهيز النص للمشاركة 📋');
        }
      }
    } catch (err) {
      console.log('Share dismissed or handled', err);
    } finally {
      setIsProcessingShare(false);
    }
  };

  const handleSend = () => {
    if (!currentSelectedVerse) return;
    audioObj?.pause();

    const verseAttachment: QuranVerseAttachment = {
      surahName: currentSelectedVerse.surahName,
      surahNumber: currentSelectedVerse.surahNumber,
      ayahNumber: startAyahNum,
      fromAyah: startAyahNum,
      toAyah: endAyahNum,
      text: combinedText,
      audioUrl: currentSelectedVerse.audioUrl,
      shareType,
      bgValue: selectedBg.value,
      bgText: selectedBg.text,
      frameType: selectedFrame.type,
      frameColor: selectedFrame.color,
      textColor: textColor,
      fontSize: fontSize,
      fontClass: selectedFont.className,
      customNote: customNote
    };

    onSendVerse(verseAttachment);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100000] flex items-center justify-center p-2 sm:p-4">
        {/* Toast alert */}
        {toastMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-emerald-400 font-bold px-4 py-2 rounded-2xl shadow-2xl border border-emerald-500/40 z-[100010] flex items-center gap-2 text-xs animate-bounce">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 max-w-2xl w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh]"
          dir="rtl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-base">
              <BookOpen size={20} />
              <span>خيارات المشاركة</span>
            </div>
            <button
              onClick={() => {
                audioObj?.pause();
                onClose();
              }}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {!selectedVerseRef ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="relative mb-3">
                <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="اكتب أي كلمة للبحث من المصحف (مثال: الحمد، نور، الكهف)..."
                  className="w-full pl-4 pr-10 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pl-1">
                {searchQuery.trim().length < 2 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold space-y-2">
                    <Sparkles size={32} className="mx-auto text-amber-500 opacity-60" />
                    <p>اكتب أي كلمة للبحث الفوري في جميع سور المصحف الشريف</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold">
                    لم يتم العثور على نتائج للكلمة "{searchQuery}"
                  </div>
                ) : (
                  searchResults.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSelectVerseRef({ surahNumber: item.surahNumber, ayahNumber: item.ayahNumber })}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition-all flex flex-col justify-between gap-2 group"
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <span>سورة {item.surahName} (الآية {toArabicDigits(item.ayahNumber)})</span>
                        <span className="text-[11px] text-slate-400 group-hover:text-emerald-500 flex items-center gap-1 font-sans">
                          <span>تحديد وتصميم بطاقة</span>
                          <ArrowRight size={12} className="rotate-180" />
                        </span>
                      </div>
                      <p className="font-serif text-base leading-loose text-slate-900 dark:text-amber-100 font-semibold">
                        ﴿ {item.text} ﴾
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col flex-1 overflow-y-auto space-y-3">
              {/* Mode Selection Tabs: نص | صورة | صفحة | صوت */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                {[
                  { id: 'text', label: 'نص', icon: Type },
                  { id: 'image', label: 'صورة', icon: ImageIcon },
                  { id: 'page', label: 'صفحة', icon: FileText },
                  { id: 'audio', label: 'صوت', icon: Volume2 },
                ].map((m) => {
                  const IconComp = m.icon;
                  const active = shareType === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => setShareType(m.id as any)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <IconComp size={14} />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Range Selector: "من" and "إلى" buttons (fully functional) */}
              <div className={`grid grid-cols-2 gap-2 text-xs font-bold transition-opacity ${shareType === 'page' ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 border border-emerald-500/30 rounded-2xl text-center">
                  <span className="text-slate-400 text-[10px] block mb-0.5">من</span>
                  <button
                    onClick={() => setRangeSelectorOpen('from')}
                    className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold active:scale-95 transition-transform"
                  >
                    {currentSurah?.name} (الآية {toArabicDigits(startAyahNum)})
                  </button>
                </div>

                <div className="p-2 bg-slate-100 dark:bg-slate-800 border border-emerald-500/30 rounded-2xl text-center">
                  <span className="text-slate-400 text-[10px] block mb-0.5">إلى</span>
                  <button
                    onClick={() => setRangeSelectorOpen('to')}
                    className="w-full py-1.5 px-2 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl text-emerald-600 dark:text-emerald-400 font-bold active:scale-95 transition-transform"
                  >
                    {currentSurah?.name} (الآية {toArabicDigits(endAyahNum)})
                  </button>
                </div>
              </div>

              {/* Center Preview Rendering according to selected shareType */}
              <div className="flex items-center justify-center py-2">
                {shareType === 'text' ? (
                  <div ref={previewCardRef} className="w-full max-w-md p-6 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center shadow-md">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block mb-2">
                      مشاركة بنمط النص
                    </span>
                    <p className={`text-base font-bold leading-loose text-slate-900 dark:text-white ${selectedFont.className}`} style={{ fontSize: `${fontSize}px`, color: textColor }}>
                      ﴿ {combinedText} ﴾
                    </p>
                    <p className="text-xs text-slate-500 mt-2 font-bold">
                      سورة {currentSurah?.name} - {startAyahNum === endAyahNum ? `آية ${toArabicDigits(startAyahNum)}` : `الآيات ${toArabicDigits(startAyahNum)} إلى ${toArabicDigits(endAyahNum)}`}
                    </p>
                    {customNote && (
                      <p className="text-xs italic text-amber-600 dark:text-amber-400 mt-2 border-t pt-2 border-slate-200 dark:border-slate-700">
                        "{customNote}"
                      </p>
                    )}
                  </div>
                ) : shareType === 'audio' ? (
                  <div className="w-full max-w-md p-6 rounded-3xl bg-emerald-950 text-white border border-emerald-500/40 text-center shadow-xl flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                      <Volume2 size={28} />
                    </div>
                    <span className="text-xs font-bold text-emerald-400">
                      مقطع صوتي - سورة {currentSurah?.name} ({startAyahNum === endAyahNum ? `آية ${toArabicDigits(startAyahNum)}` : `الآيات ${toArabicDigits(startAyahNum)}-${toArabicDigits(endAyahNum)}`})
                    </span>
                    <p className="font-serif text-sm text-slate-200 px-4 line-clamp-3">
                      ﴿ {combinedText} ﴾
                    </p>
                    <span className="text-[11px] text-amber-300 font-bold">بصوت الشيخ مشاري العفاسي 🎙️</span>
                  </div>
                ) : shareType === 'page' ? (
                  <div ref={previewCardRef} className="w-full max-w-md p-6 rounded-3xl bg-amber-50 dark:bg-slate-900 border-2 border-amber-500/40 text-center shadow-xl flex flex-col items-center justify-center gap-3">
                    <div className="border-b border-amber-500/20 pb-2 w-full text-center">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        صفحة مصحف مباركة - سورة {currentSurah?.name}
                      </span>
                    </div>
                    <p className={`font-serif text-base leading-loose font-bold text-slate-900 dark:text-amber-100 ${selectedFont.className}`} style={{ fontSize: `${fontSize}px`, color: textColor }}>
                      ﴿ {combinedText} ﴾
                    </p>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold pt-2 border-t border-amber-500/20 w-full">
                      مصحف احمد وليلي • صفحة قراءة تلاوة
                    </div>
                  </div>
                ) : (
                  /* Image Card mode matching exact design */
                  <div
                    ref={previewCardRef}
                    className="relative w-full max-w-md min-h-[220px] p-6 rounded-3xl shadow-xl flex flex-col items-center justify-between transition-all overflow-hidden border border-slate-200 dark:border-slate-800"
                    style={{
                      background: selectedBg.value,
                      color: selectedBg.text
                    }}
                  >
                    <FrameOverlay frame={selectedFrame} />

                    <div className="text-center font-serif text-xs font-bold opacity-80 mb-2" style={{ color: textColor }}>
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                    </div>

                    <div
                      className={`text-center font-bold leading-loose my-3 px-2 ${selectedFont.className}`}
                      style={{
                        fontSize: `${fontSize}px`,
                        color: textColor
                      }}
                    >
                      ﴿ {combinedText} ﴾
                    </div>

                    {customNote && (
                      <div className="text-xs italic opacity-90 my-1 font-medium" style={{ color: textColor }}>
                        "{customNote}"
                      </div>
                    )}

                    <div className="text-[11px] font-bold tracking-wide opacity-80 mt-2 font-serif" style={{ color: textColor }}>
                      سورة {currentSurah?.name} ({startAyahNum === endAyahNum ? `آية ${toArabicDigits(startAyahNum)}` : `الآيات ${toArabicDigits(startAyahNum)}-${toArabicDigits(endAyahNum)}`}) • مصحف احمد وليلي
                    </div>
                  </div>
                )}
              </div>

              {/* Design Controls for Image, Text, and Page */}
              {shareType !== 'audio' && (
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  {[
                    { id: 'bg', label: 'الخلفية', icon: ImageIcon },
                    { id: 'frame', label: 'الإطار', icon: Palette },
                    { id: 'text', label: 'النص', icon: Palette },
                    { id: 'font', label: 'الخط', icon: Type },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(activeTab === t.id ? null : (t.id as any))}
                      className={`py-2 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                        activeTab === t.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <t.icon size={13} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'bg' && shareType !== 'audio' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-2 overflow-x-auto">
                  {BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => {
                        setSelectedBg(bg);
                        setTextColor(bg.text);
                      }}
                      className={`w-9 h-9 rounded-full border-2 flex-shrink-0 transition-transform ${
                        selectedBg.id === bg.id ? 'scale-110 border-emerald-500' : 'border-transparent'
                      }`}
                      style={{ background: bg.value }}
                      title={bg.name}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'frame' && shareType !== 'audio' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-2 overflow-x-auto">
                  {FRAMES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFrame(f)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex-shrink-0 transition-all ${
                        selectedFrame.id === f.id
                          ? 'border-emerald-500 bg-emerald-600 text-white'
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              )}

              {activeTab === 'text' && shareType !== 'audio' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-2 overflow-x-auto">
                  {TEXT_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setTextColor(c)}
                      className={`w-8 h-8 rounded-full border-2 flex-shrink-0 ${
                        textColor === c ? 'ring-2 ring-emerald-500 border-white' : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              )}

              {activeTab === 'font' && shareType !== 'audio' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center gap-3">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span>الحجم:</span>
                    <button
                      onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold flex items-center justify-center"
                    >
                      <Minus size={14} />
                    </button>
                    <span>{fontSize}</span>
                    <button
                      onClick={() => setFontSize(prev => Math.min(32, prev + 2))}
                      className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold flex items-center justify-center"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />

                  <div className="flex items-center gap-1.5">
                    {FONTS.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFont(f)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                          selectedFont.id === f.id ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700'
                        }`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="نص إضافي (اختياري)..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 dark:text-white"
                />
              </div>

              {/* Action Buttons: [رجوع] | [نسخ] | [مشاركة للتطبيقات] | [إرسال للمحادثة] */}
              <div className="grid grid-cols-4 gap-1.5 pt-2">
                <button
                  onClick={() => setSelectedVerseRef(null)}
                  className="py-3 rounded-2xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-95 text-center"
                >
                  رجوع
                </button>

                <button
                  onClick={handleCopyText}
                  className="py-3 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <Copy size={14} />
                  <span>نسخ</span>
                </button>

                <button
                  onClick={handleShareToApps}
                  disabled={isProcessingShare}
                  className="py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50"
                >
                  <Share2 size={14} />
                  <span>مشاركة</span>
                </button>

                <button
                  onClick={handleSend}
                  className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1 active:scale-95"
                >
                  <Send size={14} className="rotate-180" />
                  <span>إرسال</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Range Selector Overlay Modal for choosing Ayah numbers */}
        {rangeSelectorOpen && currentSurah && (
          <div 
            className="fixed inset-0 z-[100020] bg-black/60 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setRangeSelectorOpen(null)}
          >
            <div 
              className="bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-3xl p-4 w-full max-w-xs max-h-[70vh] flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b pb-2 mb-2 border-slate-200 dark:border-slate-800">
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  اختر {rangeSelectorOpen === 'from' ? 'بداية' : 'نهاية'} الآيات (سورة {currentSurah.name})
                </span>
                <button 
                  onClick={() => setRangeSelectorOpen(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-1.5 p-1 scrollbar-hide">
                {currentSurah.ayahs.map(ay => {
                  const val = ay.numberInSurah;
                  const isSelected = rangeSelectorOpen === 'from' ? startAyahNum === val : endAyahNum === val;

                  return (
                    <button
                      key={val}
                      onClick={() => {
                        if (rangeSelectorOpen === 'from') {
                          setFromAyah(val);
                          if (val > toAyah) setToAyah(val);
                        } else {
                          setToAyah(val);
                          if (val < fromAyah) setFromAyah(val);
                        }
                        setRangeSelectorOpen(null);
                      }}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                        isSelected 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <span>الآية {toArabicDigits(val)}</span>
                      <span className="font-serif text-xs opacity-80 truncate max-w-[140px]">
                        {ay.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};

export default QuranVerseModal;
