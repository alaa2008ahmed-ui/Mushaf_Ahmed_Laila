
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { toArabic } from './constants';
import { registerBackInterceptor } from '../../hooks/useBackButton';

const stripTajweed = (text: string) => {
    if (!text) return '';
    return text.replace(/\[([a-z])(?::\d+)?\[/g, '').replace(/\]/g, '').trim();
};

interface ReviewTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    quranData: any;
    fromSurah: number;
    fromAyah: number;
    toSurah: number;
    toAyah: number;
    currentTheme: any;
    onComplete: (success: boolean) => void;
}

const ReviewTestModal: React.FC<ReviewTestModalProps> = ({
    isOpen,
    onClose,
    quranData,
    fromSurah,
    fromAyah,
    toSurah,
    toAyah,
    currentTheme,
    onComplete
}) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [options, setOptions] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [score, setScore] = useState(0);
    const [testAyahs, setTestAyahs] = useState<any[]>([]);

    useEffect(() => {
        if (!isOpen) return;
        const interceptor = () => {
            onClose();
            return true;
        };
        const unregister = registerBackInterceptor(interceptor);
        return unregister;
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            // Prepare test ayahs from range
            const ayahs: any[] = [];
            for (let s = fromSurah; s <= toSurah; s++) {
                const surah = quranData.surahs[s - 1];
                const startA = s === fromSurah ? fromAyah : 1;
                const endA = s === toSurah ? toAyah : surah.ayahs.length;
                
                for (let a = startA; a <= endA; a++) {
                    ayahs.push({
                        ...surah.ayahs[a - 1],
                        surahNumber: s,
                        ayahNumber: a
                    });
                }
            }
            setTestAyahs(ayahs);
            setCurrentStep(0);
            setScore(0);
            generateQuestion(0, ayahs);
        }
    }, [isOpen, fromSurah, fromAyah, toSurah, toAyah, quranData]);

    const generateQuestion = (step: number, ayahs: any[]) => {
        if (step >= ayahs.length) return;
        
        const correctAyah = ayahs[step];
        const distractors: any[] = [];
        
        // Pick random distractors from the same surah or nearby safely
        const surah = quranData.surahs[correctAyah.surahNumber - 1];
        let attempts = 0;
        while (distractors.length < 3 && attempts < 100) {
            attempts++;
            const targetSurah = (surah && surah.ayahs.length >= 4 && attempts < 30)
                ? surah
                : quranData.surahs[Math.floor(Math.random() * quranData.surahs.length)];
            
            if (targetSurah?.ayahs?.length) {
                const randomAyah = targetSurah.ayahs[Math.floor(Math.random() * targetSurah.ayahs.length)];
                if (
                    randomAyah && 
                    !(targetSurah.number === correctAyah.surahNumber && randomAyah.numberInSurah === correctAyah.ayahNumber) &&
                    !distractors.some(d => d.number === randomAyah.number)
                ) {
                    distractors.push(randomAyah);
                }
            }
        }
        
        const allOptions = [...distractors, correctAyah].sort(() => Math.random() - 0.5);
        setOptions(allOptions);
        setSelectedOption(null);
        setIsCorrect(null);
    };

    const handleOptionClick = (option: any, index: number) => {
        if (selectedOption !== null) return;
        
        setSelectedOption(index);
        const correct = option.numberInSurah === testAyahs[currentStep].ayahNumber;
        setIsCorrect(correct);
        
        if (correct) {
            setScore(s => s + 1);
        }
        
        setTimeout(() => {
            if (currentStep < testAyahs.length - 1) {
                const nextStep = currentStep + 1;
                setCurrentStep(nextStep);
                generateQuestion(nextStep, testAyahs);
            } else {
                // Finished
                onComplete(score + (correct ? 1 : 0) >= testAyahs.length * 0.7);
            }
        }, 1500);
    };

    if (!isOpen) return null;

    const currentAyah = testAyahs[currentStep];
    const prevAyah = currentStep > 0 ? testAyahs[currentStep - 1] : null;

    return (
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-0 sm:p-4 animate-fadeIn" dir="rtl">
            <div className="w-full max-w-lg h-full sm:h-auto max-h-[100dvh] sm:max-h-[90vh] bg-white rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-modal-enter border-0" style={{ backgroundColor: currentTheme.bg, color: currentTheme.text, border: 'none', outline: 'none' }}>
                {/* Header */}
                <div 
                    className="px-4 pb-4 border-0 flex items-center justify-between" 
                    style={{ 
                        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)'
                    }}
                >
                    <button onClick={onClose} className="p-2 quran-raised-btn rounded-xl transition-colors border-0 text-slate-700 dark:text-slate-200" title="رجوع">
                        <ArrowRight size={20} className="quran-3d-icon" />
                    </button>
                    <div className="text-center flex-1">
                        <div className="font-bold text-sm">اختبار الحفظ</div>
                        <div className="text-[10px] opacity-60">الخطوة {currentStep + 1} من {testAyahs.length}</div>
                    </div>
                    <button onClick={onClose} className="p-2 quran-raised-btn rounded-xl transition-colors border-0 text-slate-400" title="إغلاق">
                        <X size={20} className="quran-3d-icon" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="h-1.5 w-full bg-black/5">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-500 shadow-sm" 
                        style={{ width: `${((currentStep + 1) / testAyahs.length) * 100}%` }}
                    ></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Question Context */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <HelpCircle size={18} className="quran-3d-icon" />
                            <span>ما هي الآية التالية؟</span>
                        </div>
                        
                        {prevAyah && (
                            <div className="p-4 rounded-2xl quran-raised-card border-0 opacity-80">
                                <div className="text-xs mb-2 opacity-60 font-bold">الآية السابقة:</div>
                                <div className="text-lg leading-relaxed font-trad" style={{ fontFamily: 'Amiri' }}>
                                    {stripTajweed(prevAyah.text)}
                                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full border-0 quran-raised-card text-[10px] font-bold">
                                        {toArabic(prevAyah.ayahNumber)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-6 rounded-3xl border-0 quran-raised-card text-center">
                            <div className="text-2xl leading-relaxed font-bold font-trad" style={{ color: currentTheme.accent, fontFamily: 'Amiri' }}>
                                ؟؟؟
                                <span className="inline-flex items-center justify-center w-9 h-9 mr-2 rounded-full border-0 quran-raised-card text-sm font-bold">
                                    {toArabic(currentAyah?.ayahNumber || 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="grid grid-cols-1 gap-3">
                        {options.map((option, index) => {
                            const isSelected = selectedOption === index;
                            const isCorrectOption = isCorrect !== null && option.numberInSurah === currentAyah.ayahNumber;
                            const isWrongSelection = isSelected && isCorrect === false;

                            return (
                                <button
                                    key={index}
                                    disabled={selectedOption !== null}
                                    onClick={() => handleOptionClick(option, index)}
                                    className={`p-4 rounded-2xl border-0 text-right transition-all duration-300 flex items-center justify-between gap-4 ${
                                        isCorrectOption ? 'quran-raised-btn-selected bg-emerald-500 text-white shadow-lg scale-[1.02]' : 
                                        isWrongSelection ? 'bg-red-500 text-white shadow-lg scale-[1.02]' : 
                                        isSelected ? 'quran-raised-btn-selected shadow-md' : 
                                        'quran-raised-btn hover:scale-[1.01]'
                                    }`}
                                >
                                    <div className="flex-1 text-base leading-relaxed font-medium">
                                        {stripTajweed(option.text)}
                                    </div>
                                    <div className="shrink-0">
                                        {isCorrectOption ? <CheckCircle2 className="text-white" size={22} /> : 
                                         isWrongSelection ? <XCircle className="text-white" size={22} /> : 
                                         <div className="w-5 h-5 rounded-full border-0 quran-raised-card"></div>}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReviewTestModal;
