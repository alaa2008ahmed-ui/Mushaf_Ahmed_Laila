import React, { useMemo } from 'react';
import { X, Info, BookOpen, HelpCircle, Star } from 'lucide-react';
import { SURAH_DETAILS } from '../../data/surahInfoData';
import { toArabic } from './constants';

interface SurahInfoModalProps {
  surahName: string;
  surahNumber: number;
  quranData: any;
  onClose: () => void;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ surahName, surahNumber, quranData, onClose }) => {
  const details = SURAH_DETAILS[surahNumber];
  const surahData = quranData?.surahs?.[surahNumber - 1];

  const { rukus, juzsText, sajdahs } = useMemo(() => {
    if (!surahData) return { rukus: 0, juzsText: '', sajdahs: 0 };
    
    const rukuSet = new Set();
    const juzSet = new Set();
    let sajdahsCount = 0;
    
    for (const a of surahData.ayahs) {
      if (a.ruku) rukuSet.add(a.ruku);
      if (a.juz) juzSet.add(a.juz);
      if (a.sajda !== false && a.sajda !== undefined) sajdahsCount++;
    }
    
    return {
      rukus: rukuSet.size,
      juzsText: Array.from(juzSet).map(j => toArabic(j as number)).join('، '),
      sajdahs: sajdahsCount
    };
  }, [surahData]);

  if (!details || !surahData) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="modal-skinned w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border theme-card-border"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 theme-header-bg flex items-center justify-between border-b theme-card-border relative shrink-0">
          {/* Surah Number on the Right */}
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-2xl font-bold theme-header-text z-10">
            {toArabic(surahNumber)}
          </div>

          {/* Centered Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-2xl font-bold theme-header-text leading-tight" style={{ fontFamily: 'var(--font-amiri)' }}>
              {surahName}
            </h2>
            <p className="text-[10px] opacity-60 font-bold theme-header-text">تفاصيل ومعلومات</p>
          </div>

          {/* Close Button on the Left */}
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors theme-header-text z-10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar text-right theme-card-bg" dir="rtl">
          
          {/* Metadata Section - Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">مكان النزول</div>
              <div className="font-bold text-sm theme-card-text">{surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">آياتها</div>
              <div className="font-bold text-sm theme-card-text">{toArabic(surahData.ayahs.length)} آية</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">الجزء</div>
              <div className="font-bold text-sm theme-card-text">{juzsText}</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">ركوعاتها</div>
              <div className="font-bold text-sm theme-card-text">{toArabic(rukus)}</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">سجدات تلاوة</div>
              <div className="font-bold text-sm theme-card-text">{toArabic(sajdahs)}</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">تبدأ من صفحة</div>
              <div className="font-bold text-sm theme-card-text">{toArabic(surahData.ayahs[0].page)}</div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02] col-span-2 lg:col-span-2">
              <div className="text-xs opacity-60 mb-1 theme-card-text">الاسم الإنجليزي</div>
              <div className="font-bold text-sm lg:text-base theme-card-text truncate" dir="ltr">{surahData.englishNameTranslation} <span className="opacity-60 text-xs">({surahData.englishName})</span></div>
            </div>
          </div>

          {/* About */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <Info size={18} />
              <h3>نبذة عن السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.about}
            </p>
          </section>

          {/* Naming */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <HelpCircle size={18} />
              <h3>سبب التسمية</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.naming}
            </p>
          </section>

          {/* Purposes */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <BookOpen size={18} />
              <h3>مقاصد السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.purposes}
            </p>
          </section>

          {/* Virtues */}
          <section className="space-y-2">
            <div className="flex items-center gap-2 theme-accent-text font-bold text-base">
              <Star size={18} />
              <h3>فضل السورة</h3>
            </div>
            <p className="theme-card-text leading-relaxed opacity-90 pr-6 text-sm">
              {details.virtues}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SurahInfoModal;
