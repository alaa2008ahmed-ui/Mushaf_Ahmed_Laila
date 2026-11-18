import React, { useState, useEffect } from 'react';
import { BookOpen, BookMarked, Play } from 'lucide-react';
import { getAyahsInRange } from '../../utils/quranMemorizationUtils';
import { SURAH_NAMES_AR } from '../QuranReader/constants';
import { SURAH_NAMES_EN } from '../../pages/Memorization';

interface MemorizationPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: () => void;
  fromSurah: number;
  fromAyah: number;
  toSurah: number;
  toAyah: number;
  primaryColor: string;
  btnTextColor: string;
  isEn: boolean;
}

const MemorizationPreviewModal: React.FC<MemorizationPreviewModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  fromSurah,
  fromAyah,
  toSurah,
  toAyah,
  primaryColor,
  btnTextColor,
  isEn
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'tafseer'>('text');
  const [tafseerData, setTafseerData] = useState<Record<string, string>>({});
  const [loadingTafseer, setLoadingTafseer] = useState(false);

  const ayahs = React.useMemo(() => {
    if (!isOpen) return [];
    return getAyahsInRange(fromSurah, fromAyah, toSurah, toAyah);
  }, [isOpen, fromSurah, fromAyah, toSurah, toAyah]);

  useEffect(() => {
    if (isOpen && activeTab === 'tafseer' && Object.keys(tafseerData).length === 0) {
      setLoadingTafseer(true);
      fetch('/tafseer.json')
        .then(res => res.json())
        .then((items: Array<{ number: string; aya: string; text: string }>) => {
          const map: Record<string, string> = {};
          items.forEach(it => {
            map[`${it.number}:${it.aya}`] = it.text;
          });
          setTafseerData(map);
          setLoadingTafseer(false);
        })
        .catch(err => {
          console.warn('Failed to load tafseer in preview modal:', err);
          setLoadingTafseer(false);
        });
    }
  }, [isOpen, activeTab, tafseerData]);

  if (!isOpen) return null;

  const startSurahName = isEn ? SURAH_NAMES_EN[fromSurah - 1] : SURAH_NAMES_AR[fromSurah - 1];
  const endSurahName = isEn ? SURAH_NAMES_EN[toSurah - 1] : SURAH_NAMES_AR[toSurah - 1];
  const titleRange = fromSurah === toSurah
    ? `${startSurahName} (${isEn ? 'Ayahs' : 'الآيات'} ${fromAyah} - ${toAyah})`
    : `${startSurahName} (${fromAyah}) - ${endSurahName} (${toAyah})`;

  const isBlackTheme = btnTextColor === '#000000';

  return (
    <div 
      className="fixed inset-0 z-[1500] flex items-center justify-center p-3 sm:p-5 bg-black/65" 
      onClick={onClose}
      dir={isEn ? 'ltr' : 'rtl'}
    >
      <div 
        className={`settings-3d-adia-scope ${isBlackTheme ? 'settings-3d-dark' : ''} app-page-card border-0 w-full max-w-lg max-h-[88dvh] rounded-[2rem] flex flex-col overflow-hidden bg-white dark:bg-[#1E293B] text-slate-800 dark:text-zinc-100`} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 border-b border-slate-100 dark:border-white/5 flex items-center justify-start">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              className="app-3d-badge border-0 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold"
              style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
            >
              <BookOpen size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">{titleRange}</h3>
              <p className="text-[11px] opacity-60">
                {isEn ? `${ayahs.length} verses selected` : `${ayahs.length} آية محددة للحفظ`}
              </p>
            </div>
          </div>
        </div>

        {/* Segmented Tab */}
        <div className="px-5 pt-3.5 pb-1.5 overflow-visible">
          <div className="grid grid-cols-2 gap-3 overflow-visible">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`app-page-card border-0 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'text'
                  ? ''
                  : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
              }`}
              style={activeTab === 'text' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
            >
              <BookOpen size={14} />
              <span>{isEn ? 'Verses Text' : 'نص الآيات'}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tafseer')}
              className={`app-page-card border-0 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'tafseer'
                  ? ''
                  : 'bg-white dark:bg-[#0F172A] text-slate-600 dark:text-zinc-300'
              }`}
              style={activeTab === 'tafseer' ? { backgroundColor: primaryColor, color: btnTextColor } : undefined}
            >
              <BookMarked size={14} />
              <span>{isEn ? 'Tafseer & Meaning' : 'التفسير والمعنى'}</span>
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4">
          {activeTab === 'text' ? (
            <div className="wird-inner-raised p-4 rounded-2xl bg-amber-50/60 dark:bg-[#0F172A]/70 space-y-3">
              <div 
                className="memorization-quran-text text-xl leading-[2.6] text-right font-serif select-none" 
                style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
                dir="rtl"
              >
                {ayahs.map(ayah => (
                  <span key={`${ayah.surahNumber}:${ayah.ayahNumber}`} className="inline">
                    <span>{ayah.text} </span>
                    <span 
                      className="ayah-end-badge app-3d-badge border-0 inline-flex items-center justify-center w-6 h-6 mx-1 rounded-full text-xs font-bold select-none align-middle"
                      style={{ 
                        backgroundColor: `${primaryColor}18`, 
                        color: primaryColor,
                        fontFamily: "'Cairo', sans-serif"
                      }}
                    >
                      {ayah.ayahNumber}
                    </span>
                    {' '}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {loadingTafseer ? (
                <div className="p-8 text-center text-xs opacity-60 flex flex-col items-center justify-center gap-2">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{isEn ? 'Loading Tafseer...' : 'جارٍ تحميل التفسير الميسر...'}</span>
                </div>
              ) : (
                ayahs.map(ayah => {
                  const key = `${ayah.surahNumber}:${ayah.ayahNumber}`;
                  const tafseerText = tafseerData[key] || (isEn ? 'Tafseer unavailable' : 'التفسير غير متوفر حالياً');
                  return (
                    <div 
                      key={key}
                      className="app-page-card border-0 p-3.5 rounded-2xl bg-white dark:bg-[#0F172A] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs font-bold" style={{ color: primaryColor }}>
                        <span>
                          {isEn ? SURAH_NAMES_EN[ayah.surahNumber - 1] : SURAH_NAMES_AR[ayah.surahNumber - 1]} - {isEn ? `Ayah ${ayah.ayahNumber}` : `الآية ${ayah.ayahNumber}`}
                        </span>
                        <span className="text-[10px] opacity-60 font-normal">
                          {isEn ? `Page ${ayah.page}` : `صفحة ${ayah.page}`}
                        </span>
                      </div>
                      <div className="memorization-quran-text text-sm font-serif opacity-85 leading-relaxed" dir="rtl" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                        {ayah.text}
                      </div>
                      <p className="text-xs leading-relaxed opacity-90 pt-1 text-slate-700 dark:text-zinc-300">
                        {tafseerText}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-4 pt-4 pb-5 border-t border-slate-100 dark:border-white/5 flex items-center gap-3 bg-slate-50/50 dark:bg-[#0F172A]/60 overflow-visible">
          <button
            type="button"
            onClick={() => {
              onClose();
              onStartSession();
            }}
            className="app-page-card border-0 flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            style={{ backgroundColor: primaryColor, color: btnTextColor }}
          >
            <Play size={16} fill="currentColor" />
            <span>{isEn ? 'Start Memorization Now' : 'ابدأ جلسة التحفيظ الآن'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="app-page-card border-0 px-5 py-3.5 rounded-2xl font-bold text-xs bg-white dark:bg-[#1E293B] text-slate-700 dark:text-zinc-200 transition-all cursor-pointer"
          >
            {isEn ? 'Close' : 'إغلاق'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemorizationPreviewModal;
