import React, { useMemo } from 'react';
import { X, Info, BookOpen, HelpCircle, Star } from 'lucide-react';
import { SURAH_DETAILS } from '../../data/surahInfoData';
import { toArabic, SURAH_NAMES_EN } from './constants';

interface SurahInfoModalProps {
  surahName: string;
  surahNumber: number;
  quranData: any;
  onClose: () => void;
  isEnglishMode?: boolean;
}

const SurahInfoModal: React.FC<SurahInfoModalProps> = ({ surahName, surahNumber, quranData, onClose, isEnglishMode = false }) => {
  const details = SURAH_DETAILS[surahNumber];
  const surahData = quranData?.surahs?.[surahNumber - 1];
  const enSurahName = SURAH_NAMES_EN[surahNumber - 1] || surahName;

  const { rukus, juzsText, juzsList, sajdahs } = useMemo(() => {
    if (!surahData) return { rukus: 0, juzsText: '', juzsList: [], sajdahs: 0 };
    
    const rukuSet = new Set();
    const juzSet = new Set();
    let sajdahsCount = 0;
    
    for (const a of surahData.ayahs) {
      if (a.ruku) rukuSet.add(a.ruku);
      if (a.juz) juzSet.add(a.juz);
      if (a.sajda !== false && a.sajda !== undefined) sajdahsCount++;
    }
    
    const juzArray = Array.from(juzSet) as number[];
    return {
      rukus: rukuSet.size,
      juzsText: juzArray.map(j => toArabic(j)).join('، '),
      juzsList: juzArray,
      sajdahs: sajdahsCount
    };
  }, [surahData]);

  if (!details || !surahData) return null;

  return (
    <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="modal-skinned w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border theme-card-border"
        onClick={e => e.stopPropagation()}
        dir={isEnglishMode ? "ltr" : "rtl"}
      >
        {/* Header */}
        <div className="p-5 theme-header-bg flex items-center justify-between border-b theme-card-border relative shrink-0">
          {/* Surah Number */}
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/10 flex items-center justify-center text-2xl font-bold theme-header-text z-10">
            {isEnglishMode ? surahNumber : toArabic(surahNumber)}
          </div>

          {/* Centered Title */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <h2 className="text-2xl font-bold theme-header-text leading-tight" style={{ fontFamily: isEnglishMode ? 'system-ui, sans-serif' : 'var(--font-amiri)' }}>
              {isEnglishMode ? `Surah ${enSurahName}` : surahName}
            </h2>
            <p className="text-[10px] opacity-60 font-bold theme-header-text">
              {isEnglishMode ? "Details & Information" : "تفاصيل ومعلومات"}
            </p>
          </div>

          {/* Close Button */}
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors theme-header-text z-10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar ${isEnglishMode ? 'text-left' : 'text-right'} theme-card-bg`}>
          
          {/* Metadata Section - Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4">
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Revelation Place" : "مكان النزول"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode 
                  ? (surahData.revelationType === 'Meccan' ? 'Meccan' : 'Medinan')
                  : (surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية')}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Verses" : "آياتها"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode ? `${surahData.ayahs.length} Verses` : `${toArabic(surahData.ayahs.length)} آية`}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Juz" : "الجزء"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode ? juzsList.join(', ') : juzsText}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Rukus" : "ركوعاتها"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode ? rukus : toArabic(rukus)}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Sajdahs" : "سجدات تلاوة"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode ? sajdahs : toArabic(sajdahs)}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02]">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "Start Page" : "تبدأ من صفحة"}
              </div>
              <div className="font-bold text-sm theme-card-text">
                {isEnglishMode ? surahData.ayahs[0].page : toArabic(surahData.ayahs[0].page)}
              </div>
            </div>
            <div className="bg-black/5 dark:bg-white/5 rounded-xl p-3 text-center border theme-card-border transition-transform hover:scale-[1.02] col-span-2 lg:col-span-2">
              <div className="text-xs opacity-60 mb-1 theme-card-text">
                {isEnglishMode ? "English Name" : "الاسم الإنجليزي"}
              </div>
              <div className="font-bold text-sm lg:text-base theme-card-text truncate" dir="ltr">
                {surahData.englishNameTranslation} <span className="opacity-60 text-xs">({surahData.englishName})</span>
              </div>
            </div>
          </div>

          {/* About */}
          <section className="space-y-2">
            <div className={`flex items-center gap-2 theme-accent-text font-bold text-base ${isEnglishMode ? 'flex-row' : 'flex-row-reverse'}`}>
              <Info size={18} />
              <h3>{isEnglishMode ? "About the Surah" : "نبذة عن السورة"}</h3>
            </div>
            <p className={`theme-card-text leading-relaxed opacity-90 ${isEnglishMode ? 'pl-6' : 'pr-6'} text-sm`}>
              {isEnglishMode ? (details.aboutEn || `Surah ${enSurahName} is one of the blessed chapters of the Holy Quran, providing divine guidance, laws, and profound lessons for believers.`) : details.about}
            </p>
          </section>

          {/* Naming */}
          <section className="space-y-2">
            <div className={`flex items-center gap-2 theme-accent-text font-bold text-base ${isEnglishMode ? 'flex-row' : 'flex-row-reverse'}`}>
              <HelpCircle size={18} />
              <h3>{isEnglishMode ? "Reason for Naming" : "سبب التسمية"}</h3>
            </div>
            <p className={`theme-card-text leading-relaxed opacity-90 ${isEnglishMode ? 'pl-6' : 'pr-6'} text-sm`}>
              {isEnglishMode ? (details.namingEn || `Named ${enSurahName} in reference to key themes, events, or prominent subjects mentioned within this chapter.`) : details.naming}
            </p>
          </section>

          {/* Purposes */}
          <section className="space-y-2">
            <div className={`flex items-center gap-2 theme-accent-text font-bold text-base ${isEnglishMode ? 'flex-row' : 'flex-row-reverse'}`}>
              <BookOpen size={18} />
              <h3>{isEnglishMode ? "Purposes of the Surah" : "مقاصد السورة"}</h3>
            </div>
            <p className={`theme-card-text leading-relaxed opacity-90 ${isEnglishMode ? 'pl-6' : 'pr-6'} text-sm`}>
              {isEnglishMode ? (details.purposesEn || `Emphasizes core Islamic beliefs, establishment of justice, faith in Allah, and adherence to divine guidance and laws.`) : details.purposes}
            </p>
          </section>

          {/* Virtues */}
          <section className="space-y-2">
            <div className={`flex items-center gap-2 theme-accent-text font-bold text-base ${isEnglishMode ? 'flex-row' : 'flex-row-reverse'}`}>
              <Star size={18} />
              <h3>{isEnglishMode ? "Virtues of the Surah" : "فضل السورة"}</h3>
            </div>
            <p className={`theme-card-text leading-relaxed opacity-90 ${isEnglishMode ? 'pl-6' : 'pr-6'} text-sm`}>
              {isEnglishMode ? (details.virtuesEn || `Contains great blessings, spiritual light, and immense rewards for those who recite, study, and reflect upon its verses.`) : details.virtues}
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SurahInfoModal;
