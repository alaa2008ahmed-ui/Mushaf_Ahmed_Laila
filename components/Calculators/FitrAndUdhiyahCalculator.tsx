import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, Scale, Info, HeartHandshake, ShieldCheck } from 'lucide-react';

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
    cardBorderColor: propCardBorderColor,
    subTab: propSubTab,
    onSubTabChange: propOnSubTabChange
}) => {
    const { theme, themeKey } = useTheme();
    const { language } = useLanguage();
    const isEn = language === 'en';

    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = propCardBorderColor || (isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000')));

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

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: cardBorderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: theme.textColor,
        textAlign: isEn ? 'left' : 'right',
    };

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

    // Aqiqah calculation (2 sheep per boy, 1 sheep per girl)
    const mBabies = parseInt(maleBabies, 10) || 0;
    const fBabies = parseInt(femaleBabies, 10) || 0;
    const totalAqiqahSheep = (mBabies * 2) + fBabies;

    // Safety check: is animal free from defects?
    const hasAnyDefect = Object.values(checkedDefects).some(v => v === true);

    return (
        <div className="space-y-5 animate-fade-in pb-8 font-cairo" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Sub-Tabs Switcher */}
            <div id="fitr-udhiyah-subtabs" className="flex gap-2 p-1.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
                <button
                    type="button"
                    onClick={() => setSubTab('fitr')}
                    className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        subTab === 'fitr'
                            ? (isDefaultTheme ? 'bg-black text-white shadow-md' : (isBlackTheme ? 'bg-white text-black shadow-md' : 'bg-primary text-white shadow-md'))
                            : 'opacity-70 hover:opacity-100'
                    }`}
                >
                    <i className="fa-solid fa-wheat-awn"></i>
                    <span>{isEn ? 'Zakat al-Fitr' : 'زكاة الفطر'}</span>
                </button>
                <button
                    type="button"
                    onClick={() => setSubTab('udhiyah')}
                    className={`flex-1 py-2 px-3 rounded-xl font-black text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                        subTab === 'udhiyah'
                            ? (isDefaultTheme ? 'bg-black text-white shadow-md' : (isBlackTheme ? 'bg-white text-black shadow-md' : 'bg-primary text-white shadow-md'))
                            : 'opacity-70 hover:opacity-100'
                    }`}
                >
                    <i className="fa-solid fa-hand-holding-heart"></i>
                    <span>{isEn ? 'Udhiyah & Aqiqah' : 'الأضحية والعقيقة'}</span>
                </button>
            </div>

            {/* Header & Reset Button */}
            <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2" style={{ color: theme.textColor }}>
                    {subTab === 'fitr' ? (
                        <>
                            <i className="fa-solid fa-wheat-awn text-amber-600"></i>
                            <span>{isEn ? 'Blessed Zakat al-Fitr Calculator' : 'حاسبة زكاة الفطر المبارك'}</span>
                        </>
                    ) : (
                        <>
                            <i className="fa-solid fa-shield-halved text-emerald-600"></i>
                            <span>{isEn ? 'Udhiyah, Aqiqah & Shares Calculator' : 'حاسبة الأضحية والعقيقة والأنصبة'}</span>
                        </>
                    )}
                </h2>
                <button 
                    id="btn-fitr-udhiyah-reset"
                    type="button"
                    onClick={clearAll} 
                    className="flex items-center gap-1 text-xs text-red-500 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                    <RefreshCw size={13} />
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* --- TAB 1: ZAKAT AL-FITR --- */}
            {subTab === 'fitr' && (
                <div className="space-y-4">
                    {/* Input Card */}
                    <div id="fitr-card-inputs" className="themed-card p-4 sm:p-5 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <div className="space-y-4">
                            {/* Family Members Count */}
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Number of family members eligible for Zakat al-Fitr:' : 'عدد أفراد الأسرة المستحق إخراج زكاة الفطر عنهم:'}
                                </label>
                                <p className="text-[11px] opacity-70 mb-2">
                                    {isEn 
                                        ? 'Obligatory upon a Muslim for themselves and everyone they are legally obliged to maintain (spouse, dependent children, dependent parents).' 
                                        : 'تجب على المسلم عن نفسه وعن كل من تلزمه نفقته (الزوجة، الأولاد، الوالدين المحتاجين).'}
                                </p>
                                <div className="flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <input
                                            type="number"
                                            min="1"
                                            value={familyMembers}
                                            onChange={e => setFamilyMembers(e.target.value)}
                                            className="w-full p-2.5 rounded-xl text-base font-black text-center"
                                            style={inputStyle}
                                            placeholder="1"
                                        />
                                    </div>
                                    <div className="flex gap-1.5">
                                        {[1, 2, 4, 5, 7].map(num => (
                                            <button
                                                key={num}
                                                type="button"
                                                onClick={() => setFamilyMembers(String(num))}
                                                className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 transition-all cursor-pointer"
                                                style={{ color: theme.textColor }}
                                            >
                                                {num}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Unborn Baby checkbox */}
                            <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-black/5 dark:bg-white/5 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeUnbornBaby}
                                    onChange={e => setIncludeUnbornBaby(e.target.checked)}
                                    className="w-4 h-4 rounded-sm accent-primary cursor-pointer"
                                />
                                <div className="text-xs">
                                    <span className="font-bold block" style={{ color: theme.textColor }}>
                                        {isEn ? 'Include unborn baby (Recommended / Mustahabb)' : 'إضافة الجنين في بطن أمه (استحباباً)'}
                                    </span>
                                    <span className="text-[11px] opacity-70">
                                        {isEn 
                                            ? 'It is recommended to give Zakat al-Fitr for an unborn fetus if the soul has been breathed into it, following the practice of Uthman ibn Affan (RA).' 
                                            : 'يُستحب إخراج زكاة الفطر عن الحمل إذا نُفخت فيه الروح لفعل عثمان بن عفان رضي الله عنه.'}
                                    </span>
                                </div>
                            </label>

                            {/* Grain Type Selector */}
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Staple grain type of your country (Sa\'):' : 'نوع الصاع من قوت البلد:'}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                                    {GRAIN_TYPES.map(g => (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => setSelectedGrain(g.id)}
                                            className={`p-2.5 rounded-xl ${isEn ? 'text-left' : 'text-right'} transition-all border cursor-pointer ${
                                                selectedGrain === g.id
                                                    ? (isDefaultTheme ? 'bg-black text-white' : (isBlackTheme ? 'bg-white text-black' : 'bg-primary/15 border-primary'))
                                                    : 'bg-black/5 dark:bg-white/5 border-transparent opacity-80 hover:opacity-100'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center mb-0.5">
                                                <span className="font-bold text-xs">
                                                    {isEn ? g.nameEn : g.name}
                                                </span>
                                                <span className="text-[11px] font-black px-1.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                                                    {g.weight} {isEn ? 'kg' : 'كجم'}
                                                </span>
                                            </div>
                                            <p className="text-[10px] opacity-70 leading-tight">
                                                {isEn ? g.descEn : g.desc}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Cash Option */}
                            <div className="pt-2 border-t border-black/10 dark:border-white/10">
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Cash value per person (if paying in local currency):' : 'قيمة الفرد نقداً (في حال إخراج القيمة بالعملة المحلية):'}
                                </label>
                                <p className="text-[11px] opacity-70 mb-2">
                                    {isEn 
                                        ? 'The Hanafi school and a group of early scholars permitted paying the cash equivalent for ease and fulfilling the poor\'s immediate needs. Enter the amount declared by your local Fatwa authority.' 
                                        : 'أجاز جمهور فقهاء الحنفية وجماعة من السلف إخراج القيمة نقداً تيسيراً وسداً لحاجة الفقير. أدخل القيمة المحددة من دار الإفتاء ببلدك.'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0"
                                        step="any"
                                        value={cashValuePerPerson}
                                        onChange={e => setCashValuePerPerson(e.target.value)}
                                        className="w-full p-2.5 rounded-xl text-sm font-bold text-center"
                                        style={inputStyle}
                                        placeholder={isEn ? 'e.g. 35' : 'مثال: 35'}
                                    />
                                    <span className="text-xs font-bold shrink-0 opacity-80" style={{ color: theme.textColor }}>
                                        {isEn ? 'Currency / Person' : 'عملة محلية / للفرد'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Card */}
                    <div id="fitr-card-results" className="themed-card p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-amber-500/30" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-black/10 dark:border-white/10">
                            <Scale className="w-5 h-5 text-amber-600" />
                            <h3 className="font-black text-sm sm:text-base" style={{ color: theme.textColor }}>
                                {isEn ? `Zakat al-Fitr Calculation Result (${totalFitrCount} Persons)` : `نتيجة حساب زكاة الفطر (${totalFitrCount} أفراد)`}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/10 text-center">
                                <span className="text-xs opacity-75 block mb-1">
                                    {isEn ? 'In-Kind Amount (Grains & Staple Food)' : 'المقدار العيني (حبوب وطعام)'}
                                </span>
                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
                                    {totalWeightKg} <span className="text-sm font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                                <span className="text-[11px] opacity-70 block mt-1">
                                    {isEn 
                                        ? `Equivalent to ${totalFitrCount} Sa' of (${currentGrain.nameEn})` 
                                        : `يعادل ${totalFitrCount} أصواع من (${currentGrain.name})`}
                                </span>
                            </div>

                            <div className="p-3 rounded-xl bg-black/5 dark:bg-white/10 text-center">
                                <span className="text-xs opacity-75 block mb-1">
                                    {isEn ? 'Total Estimated Cash Amount' : 'المقدار النقدي الإجمالي (المقدّر)'}
                                </span>
                                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                                    {totalCashAmount}
                                </div>
                                <span className="text-[11px] opacity-70 block mt-1">
                                    {isEn ? `Based on ${cashPerPerson} per person` : `بناءً على ${cashPerPerson} للواحد`}
                                </span>
                            </div>
                        </div>

                        {/* Jurisprudence Summary */}
                        <div className={`mt-4 p-3 rounded-xl bg-black/5 dark:bg-white/5 space-y-1.5 ${isEn ? 'text-left' : 'text-right'} text-xs leading-relaxed`} dir={isEn ? 'ltr' : 'rtl'}>
                            <div className="flex items-center gap-1.5 font-bold text-amber-700 dark:text-amber-300">
                                <Info size={14} className="shrink-0" />
                                <span>{isEn ? 'Rulings & Guidelines of Zakat al-Fitr:' : 'أحكام وضوابط زكاة الفطر:'}</span>
                            </div>
                            <ul className="list-disc list-inside space-y-1 text-[11px] opacity-80">
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
                    <div id="udhiyah-card-animal" className="themed-card p-4 sm:p-5 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-black text-sm mb-2 flex items-center gap-1.5" style={{ color: theme.textColor }}>
                            <i className="fa-solid fa-cow text-emerald-600"></i>
                            <span>{isEn ? '1. Livestock Type & Minimum Age Requirements' : '1. نوع بهيمة الأنعام والشروط السنية'}</span>
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                            {ANIMAL_TYPES.map(a => (
                                <button
                                    key={a.id}
                                    type="button"
                                    onClick={() => {
                                        setSelectedAnimal(a.id);
                                        if (a.shares === 1) setMySharesCount('1');
                                    }}
                                    className={`p-3 rounded-xl ${isEn ? 'text-left' : 'text-right'} transition-all border cursor-pointer ${
                                        selectedAnimal === a.id
                                            ? (isDefaultTheme ? 'bg-black text-white' : (isBlackTheme ? 'bg-white text-black' : 'bg-primary/15 border-primary'))
                                            : 'bg-black/5 dark:bg-white/5 border-transparent opacity-80 hover:opacity-100'
                                    }`}
                                >
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-xs sm:text-sm">
                                            {isEn ? a.nameEn : a.name}
                                        </span>
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                                            {a.shares === 1 ? (isEn ? '1 Share' : 'سهم واحد') : (isEn ? `Up to ${a.shares} shares` : `حتى ${a.shares} أسهم`)}
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-amber-700 dark:text-amber-300 font-bold mb-1">
                                        {isEn ? `Minimum Islamic Age: ${a.minAgeEn}` : `السن الشرعي: ${a.minAge}`}
                                    </div>
                                    <p className="text-[10px] opacity-70 leading-tight">
                                        {isEn ? a.descEn : a.desc}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Price & Shares Input */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-3 border-t border-black/10 dark:border-white/10">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Total (or Estimated) Animal Price:' : 'سعر الذبيحة الإجمالي (أو التقديري):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={animalTotalPrice}
                                    onChange={e => setAnimalTotalPrice(e.target.value)}
                                    className="w-full p-2.5 rounded-xl text-sm font-bold text-center"
                                    style={inputStyle}
                                    placeholder="2500"
                                />
                            </div>

                            {currentAnimal.shares > 1 ? (
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? `Your shared shares (1 to ${currentAnimal.shares}):` : `عدد أسهمك المشارك بها (من 1 إلى ${currentAnimal.shares}):`}
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max={currentAnimal.shares}
                                        value={mySharesCount}
                                        onChange={e => setMySharesCount(e.target.value)}
                                        className="w-full p-2.5 rounded-xl text-sm font-bold text-center"
                                        style={inputStyle}
                                        placeholder="1"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                        {isEn ? 'Approximate Net Meat Weight (kg):' : 'الوزن التقريبي للحم الصافي (كجم):'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={approxMeatKg}
                                        onChange={e => setApproxMeatKg(e.target.value)}
                                        className="w-full p-2.5 rounded-xl text-sm font-bold text-center"
                                        style={inputStyle}
                                        placeholder={isEn ? 'e.g. 24' : 'مثال: 24'}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Shares calculation breakdown if shared animal */}
                        {currentAnimal.shares > 1 && (
                            <div className="mt-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 flex flex-wrap justify-between items-center text-xs">
                                <span>
                                    {isEn ? 'Cost of one share (1/7): ' : 'قيمة السهم الواحد (السبع): '}
                                    <strong>{singleSharePrice}</strong>
                                </span>
                                <span>
                                    {isEn ? `Total cost for your ${userShares} share(s): ` : `إجمالي تكلفة حصتك (${userShares} أسهم): `}
                                    <strong className="text-emerald-600 dark:text-emerald-400">{userSharesTotalCost}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Thirds Distribution Calculator */}
                    <div id="udhiyah-card-division" className="themed-card p-4 sm:p-5 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-black text-sm mb-2 flex items-center gap-1.5" style={{ color: theme.textColor }}>
                            <Scale className="w-4 h-4 text-primary" />
                            <span>
                                {isEn 
                                    ? '2. Recommended Division of Sacrifice (1/3 household, 1/3 gift, 1/3 charity)' 
                                    : '2. قسمة الأضحية المستحبة (الثلث للأهل، والثلث هدية، والثلث صدقة)'}
                            </span>
                        </h3>
                        <p className="text-[11px] opacity-70 mb-3">
                            {isEn 
                                ? 'It is recommended to divide the sacrifice into three portions following the Hadith: "Eat, feed others, and store away."' 
                                : 'يُستحب للمضحي أن يقسم أضحيته ثلاثة أثلاث عملاً بالحديث الشريف: «فَكُلُوا وَأَطْعِمُوا وَادَّخِرُوا».'}
                        </p>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <span className="text-[10px] font-bold block opacity-75 mb-1">
                                    {isEn ? '1/3 Eating & Storing' : 'ثلث الأكل والإدخار'}
                                </span>
                                <span className="text-xs font-black text-emerald-700 dark:text-emerald-300">
                                    {isEn ? 'For Household' : 'لأهل البيت'}
                                </span>
                                <div className="text-lg font-black mt-1">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <span className="text-[10px] font-bold block opacity-75 mb-1">
                                    {isEn ? '1/3 Gifting' : 'ثلث الإهداء'}
                                </span>
                                <span className="text-xs font-black text-blue-700 dark:text-blue-300">
                                    {isEn ? 'For Relatives & Neighbors' : 'للأقارب والجيران'}
                                </span>
                                <div className="text-lg font-black mt-1">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <span className="text-[10px] font-bold block opacity-75 mb-1">
                                    {isEn ? '1/3 Charity' : 'ثلث التصدق'}
                                </span>
                                <span className="text-xs font-black text-purple-700 dark:text-purple-300">
                                    {isEn ? 'For Poor & Needy' : 'للفقراء والمساكين'}
                                </span>
                                <div className="text-lg font-black mt-1">
                                    {totalMeatWeight > 0 ? thirdPartWeight : '—'} <span className="text-[10px] font-normal">{isEn ? 'kg' : 'كجم'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Defect Checklist */}
                    <div id="udhiyah-card-defects" className="themed-card p-4 sm:p-5 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-black text-sm flex items-center gap-1.5" style={{ color: theme.textColor }}>
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>{isEn ? '3. Health Checklist for 4 Invalidation Defects' : '3. قائمة فحص السلامة من العيوب الأربعة المانعة'}</span>
                            </h3>
                            {hasAnyDefect ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400">
                                    {isEn ? 'Invalid due to defect' : 'غير مجزئة لوجود عيب'}
                                </span>
                            ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                    {isEn ? 'Healthy & valid insha\'Allah' : 'سليمة ومجزئة إن شاء الله'}
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] opacity-70 mb-3">
                            {isEn 
                                ? 'The Prophet ﷺ said: "Four types of animals are not permissible as sacrifices: the one-eyed whose defect is obvious, the sick whose illness is obvious, the lame whose limp is obvious, and the emaciated that has no marrow in its bones."' 
                                : 'قال النبي ﷺ: «أَرْبَعٌ لا تَجُوزُ في الأَضاحِي: العَوْراءُ البَيِّنُ عَوَرُها، والمَرِيضَةُ البَيِّنُ مَرَضُها، والعَرْجاءُ البَيِّنُ ظَلْعُها، والكَسِيرَةُ التي لا تَنْقَى».'}
                        </p>

                        <div className="space-y-2">
                            {DEFECT_CHECKLIST.map(d => (
                                <label key={d.id} className="flex items-start gap-2.5 p-2 rounded-xl bg-black/5 dark:bg-white/5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={checkedDefects[d.id] || false}
                                        onChange={e => setCheckedDefects(prev => ({ ...prev, [d.id]: e.target.checked }))}
                                        className="w-4 h-4 mt-0.5 rounded-sm accent-red-500 cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-bold block" style={{ color: theme.textColor }}>
                                            {isEn ? d.labelEn : d.label}
                                        </span>
                                        <span className="text-[11px] opacity-70">
                                            {isEn ? d.descEn : d.desc}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Aqiqah Section */}
                    <div id="udhiyah-card-aqiqah" className="themed-card p-4 sm:p-5 rounded-2xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-black text-sm mb-2 flex items-center gap-1.5" style={{ color: theme.textColor }}>
                            <HeartHandshake className="w-4 h-4 text-pink-500" />
                            <span>{isEn ? '4. Newborn Aqiqah Calculator' : '4. حاسبة العقيقة عن المواليد'}</span>
                        </h3>
                        <p className="text-[11px] opacity-70 mb-3">
                            {isEn 
                                ? 'Aqiqah is an emphasized Sunnah; two equal sheep for a boy (or one), and one sheep for a girl, slaughtered on the 7th day after birth.' 
                                : 'العقيقة سنة مؤكدة؛ عن الغلام شاتان مكافئتان (أو شاة)، وعن الجارية شاة واحدة، وتُذبح في اليوم السابع لولادته.'}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Number of Boys (Male):' : 'عدد الذكور (الأولاد):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={maleBabies}
                                    onChange={e => setMaleBabies(e.target.value)}
                                    className="w-full p-2 rounded-xl text-sm font-bold text-center"
                                    style={inputStyle}
                                    placeholder="0"
                                />
                                <span className="text-[10px] opacity-60 block mt-1 text-center">
                                    {isEn ? '2 sheep per boy' : 'شاتان عن كل ولد'}
                                </span>
                            </div>

                            <div>
                                <label className="block text-xs font-bold mb-1 opacity-90" style={{ color: theme.textColor }}>
                                    {isEn ? 'Number of Girls (Female):' : 'عدد الإناث (البنات):'}
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={femaleBabies}
                                    onChange={e => setFemaleBabies(e.target.value)}
                                    className="w-full p-2 rounded-xl text-sm font-bold text-center"
                                    style={inputStyle}
                                    placeholder="0"
                                />
                                <span className="text-[10px] opacity-60 block mt-1 text-center">
                                    {isEn ? '1 sheep per girl' : 'شاة واحدة عن كل بنت'}
                                </span>
                            </div>
                        </div>

                        {totalAqiqahSheep > 0 && (
                            <div className="mt-3 p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-center">
                                <span className="text-xs font-bold opacity-80 block">
                                    {isEn ? 'Total Required Animals for Aqiqah:' : 'إجمالي الذبائح المطلوبة للعقيقة:'}
                                </span>
                                <span className="text-2xl font-black text-pink-600 dark:text-pink-400">
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
