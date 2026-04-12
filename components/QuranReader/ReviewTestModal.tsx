
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { toArabic } from './constants';

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
        
        // Pick random distractors from the same surah or nearby
        const surah = quranData.surahs[correctAyah.surahNumber - 1];
        while (distractors.length < 3) {
            const randomAyah = surah.ayahs[Math.floor(Math.random() * surah.ayahs.length)];
            if (randomAyah.numberInSurah !== correctAyah.ayahNumber && !distractors.find(d => d.numberInSurah === randomAyah.numberInSurah)) {
                distractors.push(randomAyah);
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
        <div className="fixed inset-0 z-[1200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn" dir="rtl">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-modal-enter" style={{ backgroundColor: currentTheme.bg, color: currentTheme.text }}>
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                    <div className="text-center">
                        <div className="font-bold text-sm">اختبار الحفظ</div>
                        <div className="text-[10px] opacity-50">الخطوة {currentStep + 1} من {testAyahs.length}</div>
                    </div>
                    <div className="w-10"></div>
                </div>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-black/5">
                    <div 
                        className="h-full bg-emerald-500 transition-all duration-500" 
                        style={{ width: `${((currentStep + 1) / testAyahs.length) * 100}%` }}
                    ></div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Question Context */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                            <HelpCircle size={18} />
                            <span>ما هي الآية التالية؟</span>
                        </div>
                        
                        {prevAyah && (
                            <div className="p-4 rounded-2xl bg-black/5 border border-dashed opacity-60" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                                <div className="text-xs mb-2 opacity-50">الآية السابقة:</div>
                                <div className="text-lg leading-relaxed font-trad" style={{ fontFamily: 'Amiri' }}>
                                    {stripTajweed(prevAyah.text)}
                                    <span className="inline-flex items-center justify-center w-6 h-6 mr-2 rounded-full border border-current text-[10px]">
                                        {toArabic(prevAyah.ayahNumber)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-6 rounded-2xl border-2 border-emerald-500/20 bg-emerald-500/5 text-center">
                            <div className="text-2xl leading-relaxed font-bold font-trad" style={{ color: currentTheme.accent, fontFamily: 'Amiri' }}>
                                ؟؟؟
                                <span className="inline-flex items-center justify-center w-8 h-8 mr-2 rounded-full border border-current text-sm">
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
                                    className={`p-4 rounded-2xl border-2 text-right transition-all duration-300 flex items-center justify-between gap-4 ${
                                        isCorrectOption ? 'border-emerald-500 bg-emerald-50' : 
                                        isWrongSelection ? 'border-red-500 bg-red-50' : 
                                        isSelected ? 'border-blue-500 bg-blue-50' : 
                                        'border-black/5 hover:border-emerald-500/30'
                                    }`}
                                >
                                    <div className="flex-1 text-base leading-relaxed font-medium">
                                        {stripTajweed(option.text)}
                                    </div>
                                    <div className="shrink-0">
                                        {isCorrectOption ? <CheckCircle2 className="text-emerald-500" size={20} /> : 
                                         isWrongSelection ? <XCircle className="text-red-500" size={20} /> : 
                                         <div className="w-5 h-5 rounded-full border-2 border-black/10"></div>}
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
