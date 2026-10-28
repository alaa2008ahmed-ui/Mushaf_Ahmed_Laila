import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, Scale, Info, HeartHandshake, ShieldCheck, Check } from 'lucide-react';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

interface FitrAndUdhiyahCalculatorProps {
    cardBorderColor?: string;
    subTab?: 'fitr' | 'udhiyah';
    onSubTabChange?: (tab: 'fitr' | 'udhiyah') => void;
}

const GRAIN_TYPES = [
    { 
        id: 'standard', 
        name: 'صاع قياسي معتمد (متوسط)', 
        nameEn: 'Approved Standard Sa\' (Average)', 
        weight: 2.5, 
        desc: 'الوزن المعتمد لدى أغلب لجان الفتوى المعاصرة',
        descEn: 'Approved weight by most contemporary Fatwa councils'
    },
    { 
        id: 'rice', 
        name: 'الأرز (غالب قوت البلد)', 
        nameEn: 'Rice (Common Staple)', 
        weight: 2.5, 
        desc: 'حوالي 2.5 كجم من الأرز الأبيض أو البسمتي',
        descEn: 'Approx. 2.5 kg of white or basmati rice'
    },
    { 
        id: 'wheat', 
        name: 'القمح / الدقيق', 
        nameEn: 'Wheat / Flour', 
        weight: 2.04, 
        desc: 'حوالي 2.04 كجم إلى 2.2 كجم',
        descEn: 'Approx. 2.04 kg to 2.2 kg'
    },
    { 
        id: 'dates', 
        name: 'التمر', 
        nameEn: 'Dates', 
        weight: 2.0, 
        desc: 'حوالي 2.0 كجم من التمر المتوسط الجفاف',
        descEn: 'Approx. 2.0 kg of medium dried dates'
    },
    { 
        id: 'raisins', 
        name: 'الزبيب', 
        nameEn: 'Raisins', 
        weight: 1.64, 
        desc: 'حوالي 1.64 كجم',
        descEn: 'Approx. 1.64 kg'
    },
];

const ANIMAL_TYPES = [
    { 
        id: 'sheep', 
        name: 'الضأن (الخراف)', 
        nameEn: 'Sheep (Lamb)',
        minAge: 'ما تم له 6 أشهر (جذع)', 
        minAgeEn: 'Completed 6 months (Jadha\')',
        shares: 1, 
        icon: 'fa-solid fa-shapes',
        desc: 'يجزئ عن شخص واحد وأهل بيته المشتركين معه في النفقة والسكن',
        descEn: 'Valid for 1 person and their household sharing living & support'
    },
    { 
        id: 'goat', 
        name: 'الماعز', 
        nameEn: 'Goat',
        minAge: 'ما تم له سنة كاملة ودخل في الثانية (ثني)', 
        minAgeEn: 'Completed 1 full year entering 2nd (Thaniyy)',
        shares: 1, 
        icon: 'fa-solid fa-shapes',
        desc: 'يجزئ عن شخص واحد وأهل بيته المشتركين معه في النفقة والسكن',
        descEn: 'Valid for 1 person and their household sharing living & support'
    },
    { 
        id: 'cow', 
        name: 'البقر والجاموس', 
        nameEn: 'Cattle & Cows',
        minAge: 'ما تم له سنتان كاملتان ودخل في الثالثة (ثني)', 
        minAgeEn: 'Completed 2 full years entering 3rd (Thaniyy)',
        shares: 7, 
        icon: 'fa-solid fa-scale-balanced',
        desc: 'تجزئ عن 7 أشخاص وأسرهم؛ يجوز الاشتراك فيها حتى سبعة أسهم',
        descEn: 'Valid for 7 people and their families; partnership allowed up to 7 shares'
    },
    { 
        id: 'camel', 
        name: 'الإبل (الجمال)', 
        nameEn: 'Camel',
        minAge: 'ما تم له 5 سنوات كاملة ودخل في السادسة (ثني)', 
        minAgeEn: 'Completed 5 full years entering 6th (Thaniyy)',
        shares: 7, 
        icon: 'fa-solid fa-scale-balanced',
        desc: 'تجزئ عن 7 أشخاص وأسرهم؛ وأجاز بعض العلماء اشتراك حتى 10',
        descEn: 'Valid for 7 people and their families; some scholars permit up to 10 shares'
    },
];

const DEFECT_CHECKLIST = [
    { 
        id: 'eye', 
        label: 'العوراء البيّن عورها', 
        labelEn: 'Blind in one eye with an obvious defect',
        desc: 'التي انخسفت عينها أو ذهب بصرها، فلا تجزئ',
        descEn: 'Whose eye has sunk or sight is gone, not permissible'
    },
    { 
        id: 'sick', 
        label: 'المريضة البيّن مرضها', 
        labelEn: 'The sick animal with an obvious illness',
        desc: 'التي يظهر عليها أثر المرض أو الحمى أو الجرب الشديد',
        descEn: 'Showing clear symptoms of illness, fever, or severe mange'
    },
    { 
        id: 'lame', 
        label: 'العرجاء البيّن ظلعها', 
        labelEn: 'The lame animal with an obvious limp',
        desc: 'التي لا تقدر على السير مع سائر القطيع إلى المنحر',
        descEn: 'Unable to walk with the rest of the herd to the slaughter place'
    },
    { 
        id: 'thin', 
        label: 'العجفاء / الكسيرة التي لا تنقي', 
        labelEn: 'The emaciated animal with no marrow',
        desc: 'الهزيلة الضعيفة التي لا مخ في عظامها لنحافتها',
        descEn: 'Extremely frail and weak with no marrow in its bones'
    },
];

const FitrAndUdhiyahCalculator: React.FC<FitrAndUdhiyahCalculatorProps> = ({ 
    subTab: propSubTab,
    onSubTabChange: propOnSubTabChange
}) => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { language } = useLanguage();
    const isEn = language === 'en';

    // Mode: 'fitr' (Zakat al-Fitr) or 'udhiyah' (Udhiyah & Aqiqah)
    const [internalSubTab, setInternalSubTab] = useState<'fitr' | 'udhiyah'>('fitr');
    const subTab = propSubTab !== undefined ? propSubTab : internalSubTab;
    const setSubTab = (tab: 'fitr' | 'udhiyah') => {
        if (propOnSubTabChange) propOnSubTabChange(tab);
        setInternalSubTab(tab);
    };

    // --- 1. Zakat al-Fitr States ---
    const [familyMembers, setFamilyMembers] = useState<string>('4');
    const [selectedGrain, setSelectedGrain] = useState<string>('rice');
    const [cashValuePerPerson, setCashValuePerPerson] = useState<string>('35');
    const [includeUnbornBaby, setIncludeUnbornBaby] = useState<boolean>(false);

    // --- 2. Udhiyah & Aqiqah States ---
    const [selectedAnimal, setSelectedAnimal] = useState<string>('sheep');
    const [animalTotalPrice, setAnimalTotalPrice] = useState<string>('2500');
    const [mySharesCount, setMySharesCount] = useState<string>('1');
    const [approxMeatKg, setApproxMeatKg] = useState<string>('24');

    // Aqiqah states
    const [maleBabies, setMaleBabies] = useState<string>('0');
    const [femaleBabies, setFemaleBabies] = useState<string>('0');

    // Defect checklist states
    const [checkedDefects, setCheckedDefects] = useState<Record<string, boolean>>({
        eye: false,
        sick: false,
        lame: false,
        thin: false,
    });

    const clearAll = () => {
        if (subTab === 'fitr') {
            setFamilyMembers('1');
            setCashValuePerPerson('0');
            setIncludeUnbornBaby(false);
        } else {
            setAnimalTotalPrice('0');
            setApproxMeatKg('0');
            setMaleBabies('0');
            setFemaleBabies('0');
            setCheckedDefects({ eye: false, sick: false, lame: false, thin: false });
        }
    };

    // Calculations for Fitr
    const baseCount = parseInt(familyMembers, 10) || 0;
    const totalFitrCount = baseCount + (includeUnbornBaby ? 1 : 0);
    const currentGrain = GRAIN_TYPES.find(g => g.id === selectedGrain) || GRAIN_TYPES[0];
    const totalWeightKg = (totalFitrCount * currentGrain.weight).toFixed(2);
    const cashPerPerson = parseFloat(cashValuePerPerson) || 0;
    const totalCashAmount = (totalFitrCount * cashPerPerson).toFixed(2);

    // Calculations for Udhiyah & Shares
    const currentAnimal = ANIMAL_TYPES.find(a => a.id === selectedAnimal) || ANIMAL_TYPES[0];
    const totalPrice = parseFloat(animalTotalPrice) || 0;
    const userShares = Math.min(currentAnimal.shares, Math.max(1, parseInt(mySharesCount, 10) || 1));
    const singleSharePrice = currentAnimal.shares > 1 ? (totalPrice / currentAnimal.shares).toFixed(2) : totalPrice.toFixed(2);
    const userSharesTotalCost = currentAnimal.shares > 1 ? (parseFloat(singleSharePrice) * userShares).toFixed(2) : totalPrice.toFixed(2);

    // Thirds distribution
    const totalMeatWeight = parseFloat(approxMeatKg) || 0;
    const thirdPartWeight = (totalMeatWeight / 3).toFixed(1);

    // Aqiqah calculation
    const mBabies = parseInt(maleBabies, 10) || 0;
    const fBabies = parseInt(femaleBabies, 10) || 0;
    const totalAqiqahSheep = (mBabies * 2) + fBabies;

    // Safety check: is animal free from defects?
    const hasAnyDefect = Object.values(checkedDefects).some(v => v === true);

    return (
        <div className="space-y-4 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Sub-Tabs Switcher (Zero Border Segmented Pill) */}
            <div 
                id="fitr-udhiyah-subtabs" 
                className="flex gap-1.5 p-1.5 rounded-2xl border-0"
                style={{ backgroundColor: tokens.isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
            >
                <button
                    type="button"
                    onClick={() => setSubTab('fitr')}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
                    style={{
                        backgroundColor: subTab === 'fitr' ? tokens.primaryColor : 'transparent',
                        color: subTab === 'fitr' ? '#FFFFFF' : tokens.textColor,
                        boxShadow: subTab === 'fitr' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-wheat-awn"></i>
                    <span>{isEn ? 'Zakat al-Fitr' : 'زكاة الفطر'}</span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('udhiyah')}
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border-0"
                    style={{
                        backgroundColor: subTab === 'udhiyah' ? tokens.primaryColor : 'transparent',
                        color: subTab === 'udhiyah' ? '#FFFFFF' : tokens.textColor,
                        boxShadow: subTab === 'udhiyah' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                >
                    <i className="fa-solid fa-hand-holding-heart"></i>
                    <span>{isEn ? 'Udhiyah & Aqiqah' : 'الأضحية والعقيقة'}</span>
                </button>
            </div>

            {/* Header & Reset Button */}
            <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
                    {subTab === 'fitr' ? (
                        <>
                            <i className="fa-solid fa-wheat-awn" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? 'Blessed Zakat al-Fitr Calculator' : 'حاسبة زكاة الفطر المبارك'}</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-shield-halved" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? 'Udhiyah, Aqiqah & Shares Calculator' : 'حاسبة الأضحية والعقيقة والأنصبة'}</span>
                        </>
                    )}
                </h2>
                <button 
                    id="btn-fitr-udhiyah-reset"
                    type="button"
                    onClick={clearAll} 
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border-0"
                >
                    <RefreshCw size={14} />
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* --- TAB 1: ZAKAT AL-FITR --- */}
            {subTab === 'fitr' && (
                <div className="space-y-4">
                    {/* Input Card */}
                    <div 
                        id="fitr-card-inputs" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div className="space-y-4">
                            {/* Family Members Count */}
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Number of family members eligible for Zakat al-Fitr:' : 'عدد أفراد الأسرة المستحق إخراج زكاة الفطر عنهم:'}
                                </label>
                                <p className="text-[11px] opacity-75 mb-2 font-normal" style={{ color: tokens.subtextColor }}>
                                    {isEn 
                                        ? 'Obligatory upon a Muslim for themselves and everyone they are legally obliged to maintain (spouse, dependent children, dependent parents).' 
                                        : 'تجب على المسلم عن نفسه وعن كل من تلزمه نفقته (الزوجة، الأولاد، الوالدين المحتاجين).'}
                                </p>
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="number"
                                        min="1"
                                        value={familyMembers}
                                        onChange={e => setFamilyMembers(e.target.value)}
                                        className="w-24 p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-center font-bold text-base focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
                                        style={{ color: tokens.textColor }}
                                        placeholder="1"
                                    />
                                    <div className="flex gap-1.5 flex-wrap">
                                        {[1, 2, 4, 5, 7].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setFamilyMembers(String(num))}
                                                className="px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                                                style={{
                                                    backgroundColor: String(num) === familyMembers ? tokens.primaryColor : (tokens.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                                                    color: String(num) === familyMembers ? '#FFFFFF' : tokens.textColor
                                                }}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Unborn Baby Button */}
                            <button
                                type="button"
                                onClick={() => setIncludeUnbornBaby(!includeUnbornBaby)}
                                className="flex items-start gap-2.5 p-3 rounded-xl transition-all cursor-pointer border-0 text-start w-full"
                                style={{ 
                                    backgroundColor: includeUnbornBaby ? hexToRgba(tokens.primaryColor, 0.12) : (tokens.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)')
                                }}
                            >
                                <div 
                                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                                    style={{
                                        backgroundColor: includeUnbornBaby ? tokens.primaryColor : 'rgba(150, 150, 150, 0.2)',
                                        color: includeUnbornBaby ? '#FFFFFF' : 'transparent'
                                    }}
                                >
                                    <Check size={12} strokeWidth={3} />
                                </div>
                                <div className="text-xs">
                                    <span className="font-bold block" style={{ color: includeUnbornBaby ? tokens.primaryColor : tokens.textColor }}>
                                        {isEn ? 'Include unborn baby (Recommended / Mustahabb)' : 'إضافة الجنين في بطن أمه (استحباباً)'}
                                    </span>
                                    <span className="text-[11px] opacity-75 font-normal leading-tight block mt-0.5" style={{ color: tokens.subtextColor }}>
                                        {isEn 
                                            ? 'It is recommended to give Zakat al-Fitr for an unborn fetus if the soul has been breathed into it, following the practice of Uthman ibn Affan (RA).' 
                                            : 'يُستحب إخراج زكاة الفطر عن الحمل إذا نُفخت فيه الروح لفعل عثمان بن عفان رضي الله عنه.'}
                                    </span>
                                </div>
                            </button>

                            {/* Grain Type Selector */}
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Staple grain type of your country (Sa\'):' : 'نوع الصاع من قوت البلد:'}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                                    {GRAIN_TYPES.map(g => {
                                        const isSelected = selectedGrain === g.id;
                                        return (
                                            <button
                                                key={g.id}
                                                type="button"
                                                onClick={() => setSelectedGrain(g.id)}
                                                className="p-3 rounded-xl border-0 transition-all text-start cursor-pointer flex flex-col justify-between"
                                                style={{
                                                    backgroundColor: isSelected ? hexToRgba(tokens.primaryColor, 0.12) : (tokens.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                                    color: tokens.textColor
                                                }}
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-xs" style={{ color: isSelected ? tokens.primaryColor : tokens.textColor }}>
                                                        {isEn ? g.nameEn : g.name}
                                                    </span>
                                                    <span 
                                                        className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                                        style={{ 
                                                            backgroundColor: isSelected ? tokens.primaryColor : (tokens.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                                            color: isSelected ? '#FFFFFF' : tokens.textColor
                                                        }}
                                                    >
                                                        {g.weight} {isEn ? 'kg' : 'كجم'}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] opacity-75 font-normal leading-tight" style={{ color: tokens.subtextColor }}>
                                                    {isEn ? g.descEn : g.desc}
                                                </p>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Cash Option */}
                            <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Cash value per person (if paying in local currency):' : 'قيمة الفرد نقداً (في حال إخراج القيمة بالعملة المحلية):'}
                                </label>
                                <p className="text-[11px] opacity-75 mb-2 font-normal" style={{ color: tokens.subtextColor }}>
                                    {isEn 
                                        ? 'The Hanafi school and a group of early scholars permitted paying the cash equivalent for ease and fulfilling the poor\'s immediate needs.' 
                                        : 'أجاز جمهور فقهاء الحنفية وجماعة من السلف إخراج القيمة نقداً تيسيراً وسداً لحاجة الفقير. أدخل القيمة المحددة ببلدك.'}
                                </p>
                                <div className="flex items-center gap-2.5">
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={cashValuePerPerson}
                                        onChange={e => setCashValuePerPerson(e.target.value)}
                                        className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
                                        style={{ color: tokens.textColor }}
                                        placeholder={isEn ? 'e.g. 35' : 'مثال: 35'}
                                    />
                                    <span className="text-xs font-bold shrink-0 opacity-80" style={{ color: tokens.textColor }}>
                                        {isEn ? 'Currency / Person' : 'عملة محلية / للفرد'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div 
                        id="fitr-card-results" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-zinc-800">
                            <Scale className="w-5 h-5" style={{ color: tokens.primaryColor }} />
                            <h3 className="font-bold text-sm sm:text-base" style={{ color: tokens.textColor }}>
                                {isEn ? `Zakat al-Fitr Calculation Result (${totalFitrCount} Persons)` : `نتيجة حساب زكاة الفطر (${totalFitrCount} أفراد)`}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div 
                                className="p-4 rounded-xl text-center"
                                style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.08) }}
                            >
                                <span className="text-xs opacity-75 block mb-1" style={{ color: tokens.textColor }}>
                                    {isEn ? 'In-Kind Amount (Grains & Staple Food)' : 'المقدار العيني (حبوب وطعام)'}
                                </span>
                                <div className="text-2xl font-black font-sans" style={{ color: tokens.primaryColor }}>
                                    {totalWeightKg} <span className="text-sm font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                                <span className="text-[11px] opacity-70 block mt-1" style={{ color: tokens.subtextColor }}>
                                    {isEn 
                                        ? `Equivalent to ${totalFitrCount} Sa' of (${currentGrain.nameEn})` 
                                        : `يعادل ${totalFitrCount} أصواع من (${currentGrain.name})`}
                                </span>
                            </div>

                            <div 
                                className="p-4 rounded-xl text-center"
                                style={{ backgroundColor: 'rgba(16, 185, 129, 0.08)' }}
                            >
                                <span className="text-xs opacity-75 block mb-1" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Total Estimated Cash Amount' : 'المقدار النقدي الإجمالي (المقدّر)'}
                                </span>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-sans">
                                    {totalCashAmount}
                                </div>
                                <span className="text-[11px] opacity-70 block mt-1" style={{ color: tokens.subtextColor }}>
                                    {isEn ? `Based on ${cashPerPerson} per person` : `بناءً على ${cashPerPerson} للواحد`}
                                </span>
                            </div>
                        </div>

                        {/* Jurisprudence Summary */}
                        <div 
                            className={`mt-4 p-3.5 rounded-xl space-y-1.5 ${isEn ? 'text-left' : 'text-right'} text-xs leading-relaxed`} 
                            style={{ backgroundColor: tokens.isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                            dir={isEn ? 'ltr' : 'rtl'}
                        >
                            <div className="flex items-center gap-1.5 font-bold" style={{ color: tokens.primaryColor }}>
                                <Info size={14} className="shrink-0" />
                                <span>{isEn ? 'Rulings & Guidelines of Zakat al-Fitr:' : 'أحكام وضوابط زكاة الفطر:'}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-80" style={{ color: tokens.subtextColor }}>
                                <li>
                                    <strong>{isEn ? 'Time of obligation: ' : 'وقت الوجوب: '}</strong>
                                    {isEn ? 'At sunset on the eve of Eid al-Fitr (last day of Ramadan).' : 'بغروب شمس ليلة العيد (آخر يوم من رمضان).'}
                                </li>
                                <li>
                                    <strong>{isEn ? 'Best time to pay: ' : 'أفضل وقت لإخراجها: '}</strong>
                                    {isEn ? 'On Eid morning before the Eid prayer; delaying it without an excuse is not permissible.' : 'صباح يوم العيد قبل صلاة العيد؛ ولا يجوز تأخيرها عنها بغير عذر.'}
                                </li>
                                <li>
                                    <strong>{isEn ? 'Early payment: ' : 'التعجيل: '}</strong>
                                    {isEn ? 'Permissible one or two days before Eid, and Hanafis and Shafi\'is allow giving it from the start of Ramadan.' : 'يجوز إخراجها قبل العيد بيوم أو يومين، وأجاز الحنفية والشافعية إخراجها من أول رمضان.'}
                                </li>
                                <li>
                                    <strong>{isEn ? 'Recipients: ' : 'المصارف: '}</strong>
                                    {isEn ? 'Given to the poor and needy Muslims as purification for the fasting person and sustenance for the needy.' : 'تُدفع لفقراء المسلمين ومساكينهم طهرةً للصائم وطعمةً للمساكين.'}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TAB 2: UDHIYAH & AQIQAH --- */}
            {subTab === 'udhiyah' && (
                <div className="space-y-4">
                    {/* Animal Selection & Shares */}
                    <div 
                        id="udhiyah-card-animal" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: tokens.textColor }}>
                            <i className="fa-solid fa-cow" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? '1. Livestock Type & Minimum Age Requirements' : '1. نوع بهيمة الأنعام والشروط السنية'}</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                            {ANIMAL_TYPES.map(a => {
                                const isSelected = selectedAnimal === a.id;
                                return (
                                    <button
                                        key={a.id}
                                        type="button"
                                        onClick={() => {
                                            setSelectedAnimal(a.id);
                                            if (a.shares === 1) setMySharesCount('1');
                                        }}
                                        className="p-3.5 rounded-xl border-0 transition-all text-start cursor-pointer flex flex-col justify-between"
                                        style={{
                                            backgroundColor: isSelected ? hexToRgba(tokens.primaryColor, 0.12) : (tokens.isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'),
                                            color: tokens.textColor
                                        }}
                                    >
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-xs sm:text-sm" style={{ color: isSelected ? tokens.primaryColor : tokens.textColor }}>
                                                {isEn ? a.nameEn : a.name}
                                            </span>
                                            <span 
                                                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                                                style={{ 
                                                    backgroundColor: isSelected ? tokens.primaryColor : (tokens.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'),
                                                    color: isSelected ? '#FFFFFF' : tokens.textColor
                                                }}
                                            >
                                                {a.shares === 1 ? (isEn ? '1 Share' : 'سهم واحد') : (isEn ? `Up to ${a.shares} shares` : `حتى ${a.shares} أسهم`)}
                                            </span>
                                        </div>
                                        <div className="text-[11px] font-bold mb-1" style={{ color: tokens.primaryColor }}>
                                            {isEn ? `Minimum Age: ${a.minAgeEn}` : `السن الشرعي: ${a.minAge}`}
                                        </div>
                                        <p className="text-[10px] opacity-75 font-normal leading-tight" style={{ color: tokens.subtextColor }}>
                                            {isEn ? a.descEn : a.desc}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Price & Shares Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Total (or Estimated) Animal Price:' : 'سعر الذبيحة الإجمالي (أو التقديري):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={animalTotalPrice}
                                    onChange={e => setAnimalTotalPrice(e.target.value)}
                                    className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
                                    style={{ color: tokens.textColor }}
                                    placeholder="2500"
                                />
                            </div>

                            {currentAnimal.shares > 1 ? (
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                        {isEn ? `Your shared shares (1 to ${currentAnimal.shares}):` : `عدد أسهمك المشارك بها (من 1 إلى ${currentAnimal.shares}):`}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={currentAnimal.shares}
                                        value={mySharesCount}
                                        onChange={e => setMySharesCount(e.target.value)}
                                        className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
                                        style={{ color: tokens.textColor }}
                                        placeholder="1"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                        {isEn ? 'Approximate Net Meat Weight (kg):' : 'الوزن التقريبي للحم الصافي (كجم):'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={approxMeatKg}
                                        onChange={e => setApproxMeatKg(e.target.value)}
                                        className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-primary/40 focus:outline-hidden"
                                        style={{ color: tokens.textColor }}
                                        placeholder={isEn ? 'e.g. 24' : 'مثال: 24'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Shares calculation breakdown if shared animal */}
                        {currentAnimal.shares > 1 && (
                            <div 
                                className="mt-3 p-3 rounded-xl flex flex-wrap justify-between items-center text-xs"
                                style={{ backgroundColor: hexToRgba(tokens.primaryColor, 0.08) }}
                            >
                                <span style={{ color: tokens.textColor }}>
                                    {isEn ? 'Cost of one share (1/7): ' : 'قيمة السهم الواحد (السبع): '}
                                    <strong className="font-sans">{singleSharePrice}</strong>
                                </span>
                                <span style={{ color: tokens.textColor }}>
                                    {isEn ? `Total for your ${userShares} share(s): ` : `إجمالي حصتك (${userShares} أسهم): `}
                                    <strong className="font-sans font-bold" style={{ color: tokens.primaryColor }}>{userSharesTotalCost}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Thirds Distribution Calculator */}
                    <div 
                        id="udhiyah-card-division" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: tokens.textColor }}>
                            <Scale className="w-4 h-4" style={{ color: tokens.primaryColor }} />
                            <span>
                                {isEn 
                                    ? '2. Recommended Division of Sacrifice (1/3 household, 1/3 gift, 1/3 charity)' 
                                    : '2. قسمة الأضحية المستحبة (الثلث للأهل، والثلث هدية، والثلث صدقة)'}
                            </span>
                        </h3>
                        <p className="text-[11px] opacity-75 mb-3 font-normal" style={{ color: tokens.subtextColor }}>
                            {isEn 
                                ? 'It is recommended to divide the sacrifice into three portions following the Hadith: "Eat, feed others, and store away."' 
                                : 'يُستحب للمضحي أن يقسم أضحيته ثلاثة أثلاث عملاً بالحديث الشريف: «فَكُلُوا وَأَطْعِمُوا وَادَّخِرُوا».'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3.5 rounded-xl bg-emerald-500/10 border-0">
                                <span className="text-[10px] font-bold block opacity-75 mb-1" style={{ color: tokens.textColor }}>
                                    {isEn ? '1/3 Eating & Storing' : 'ثلث الأكل والإدخار'}
                                </span>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                                    {isEn ? 'For Household' : 'لأهل البيت'}
                                </span>
                                <div className="text-base sm:text-lg font-black mt-1 font-sans text-emerald-600 dark:text-emerald-400">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-blue-500/10 border-0">
                                <span className="text-[10px] font-bold block opacity-75 mb-1" style={{ color: tokens.textColor }}>
                                    {isEn ? '1/3 Gifting' : 'ثلث الإهداء'}
                                </span>
                                <span className="text-xs font-bold text-blue-700 dark:text-blue-300">
                                    {isEn ? 'Relatives & Friends' : 'للأقارب والجيران'}
                                </span>
                                <div className="text-base sm:text-lg font-black mt-1 font-sans text-blue-600 dark:text-blue-400">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                            <div className="p-3.5 rounded-xl bg-purple-500/10 border-0">
                                <span className="text-[10px] font-bold block opacity-75 mb-1" style={{ color: tokens.textColor }}>
                                    {isEn ? '1/3 Charity' : 'ثلث التصدق'}
                                </span>
                                <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                                    {isEn ? 'For Poor & Needy' : 'للفقراء والمساكين'}
                                </span>
                                <div className="text-base sm:text-lg font-black mt-1 font-sans text-purple-600 dark:text-purple-400">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Defect Checklist */}
                    <div 
                        id="udhiyah-card-defects" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-sm flex items-center gap-1.5" style={{ color: tokens.textColor }}>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>{isEn ? '3. Health Checklist for 4 Invalidation Defects' : '3. قائمة فحص السلامة من العيوب الأربعة المانعة'}</span>
                            </h3>
                            {hasAnyDefect ? (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
                                    {isEn ? 'Invalid' : 'غير مجزئة'}
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                                    {isEn ? 'Healthy' : 'سليمة ومجزئة'}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] opacity-75 mb-3 font-normal" style={{ color: tokens.subtextColor }}>
                            {isEn 
                                ? 'The Prophet ﷺ said: "Four types of animals are not permissible as sacrifices: the one-eyed whose defect is obvious, the sick whose illness is obvious, the lame whose limp is obvious, and the emaciated that has no marrow."' 
                                : 'قال النبي ﷺ: «أَرْبَعٌ لا تَجُوزُ في الأَضاحِي: العَوْراءُ البَيِّنُ عَوَرُها، والمَرِيضَةُ البَيِّنُ مَرَضُها، والعَرْجاءُ البَيِّنُ ظَلْعُها، والكَسِيرَةُ التي لا تَنْقَى».'}
                        </p>

                        <div className="space-y-2">
                            {DEFECT_CHECKLIST.map(d => {
                                const checked = checkedDefects[d.id] || false;
                                return (
                                    <button
                                        key={d.id}
                                        type="button"
                                        onClick={() => setCheckedDefects(prev => ({ ...prev, [d.id]: !prev[d.id] }))}
                                        className="flex items-start gap-2.5 p-3 rounded-xl transition-all cursor-pointer border-0 text-start w-full"
                                        style={{
                                            backgroundColor: checked ? 'rgba(239, 68, 68, 0.12)' : (tokens.isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)')
                                        }}
                                    >
                                        <div 
                                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                                            style={{
                                                backgroundColor: checked ? '#EF4444' : 'rgba(150, 150, 150, 0.2)',
                                                color: checked ? '#FFFFFF' : 'transparent'
                                            }}
                                        >
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <div className="text-xs min-w-0">
                                            <span className="font-bold block" style={{ color: checked ? '#EF4444' : tokens.textColor }}>
                                                {isEn ? d.labelEn : d.label}
                                            </span>
                                            <span className="text-[11px] opacity-75 font-normal leading-tight block mt-0.5" style={{ color: tokens.subtextColor }}>
                                                {isEn ? d.descEn : d.desc}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Aqiqah Section */}
                    <div 
                        id="udhiyah-card-aqiqah" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <h3 className="font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: tokens.textColor }}>
                            <HeartHandshake className="w-4 h-4 text-pink-500" />
                            <span>{isEn ? '4. Newborn Aqiqah Calculator' : '4. حاسبة العقيقة عن المواليد'}</span>
                        </h3>
                        <p className="text-[11px] opacity-75 mb-3 font-normal" style={{ color: tokens.subtextColor }}>
                            {isEn 
                                ? 'Aqiqah is an emphasized Sunnah; two equal sheep for a boy (or one), and one sheep for a girl, slaughtered on the 7th day after birth.' 
                                : 'العقيقة سنة مؤكدة؛ عن الغلام شاتان مكافئتان (أو شاة)، وعن الجارية شاة واحدة، وتُذبح في اليوم السابع لولادته.'}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Number of Boys (Male):' : 'عدد الذكور (الأولاد):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={maleBabies}
                                    onChange={e => setMaleBabies(e.target.value)}
                                    className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-pink-500/40 focus:outline-hidden"
                                    style={{ color: tokens.textColor }}
                                    placeholder="0"
                                />
                                <span className="text-[10px] opacity-70 block mt-1 text-center" style={{ color: tokens.subtextColor }}>
                                    {isEn ? '2 sheep per boy' : 'شاتان عن كل ولد'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Number of Girls (Female):' : 'عدد الإناث (البنات):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={femaleBabies}
                                    onChange={e => setFemaleBabies(e.target.value)}
                                    className="w-full p-3 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 text-sm font-bold text-center focus:ring-2 focus:ring-pink-500/40 focus:outline-hidden"
                                    style={{ color: tokens.textColor }}
                                    placeholder="0"
                                />
                                <span className="text-[10px] opacity-70 block mt-1 text-center" style={{ color: tokens.subtextColor }}>
                                    {isEn ? '1 sheep per girl' : 'شاة واحدة عن كل بنت'}
                                </span>
                            </div>
                        </div>

                        {totalAqiqahSheep > 0 && (
                            <div className="mt-3.5 p-4 rounded-xl bg-pink-500/10 border-0 text-center">
                                <span className="text-xs font-bold opacity-80 block" style={{ color: tokens.textColor }}>
                                    {isEn ? 'Total Required Animals for Aqiqah:' : 'إجمالي الذبائح المطلوبة للعقيقة:'}
                                </span>
                                <span className="text-2xl font-black text-pink-600 dark:text-pink-400 font-sans">
                                    {totalAqiqahSheep} <span className="text-sm font-normal">{isEn ? 'sheep / head' : 'شاة / رأس'}</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FitrAndUdhiyahCalculator;
