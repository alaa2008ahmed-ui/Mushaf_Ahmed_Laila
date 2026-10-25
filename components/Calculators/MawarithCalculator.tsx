import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';

const HEIR_NAME_TRANSLATIONS: Record<string, string> = {
    'الزوج': 'Husband',
    'الزوجة': 'Wife',
    'الزوجات': 'Wives',
    'الأب': 'Father',
    'الأم': 'Mother',
    'الابن': 'Son',
    'الأبناء': 'Sons',
    'البنت': 'Daughter',
    'البنات': 'Daughters',
    'ابن الابن': 'Grandson (Son of Son)',
    'أبناء الابن': 'Grandsons (Sons of Son)',
    'بنت الابن': 'Granddaughter (Daughter of Son)',
    'بنات الابن': 'Granddaughters (Daughters of Son)',
    'الجد لأب': 'Paternal Grandfather',
    'الجدة لأم': 'Maternal Grandmother',
    'الجدة لأب': 'Paternal Grandmother',
    'الأخ الشقيق': 'Full Brother',
    'الإخوة الأشقاء': 'Full Brothers',
    'الأخت الشقيقة': 'Full Sister',
    'الأخوات الشقيقات': 'Full Sisters',
    'الأخ لأب': 'Paternal Brother',
    'الإخوة لأب': 'Paternal Brothers',
    'الأخت لأب': 'Paternal Sister',
    'الأخوات لأب': 'Paternal Sisters',
    'الأخ لأم': 'Maternal Brother',
    'الأخت لأم': 'Maternal Sister',
    'الإخوة والأخوات لأم': 'Maternal Siblings',
    'ابن الأخ الشقيق': 'Full Nephew',
    'أبناء الأخ الشقيق': 'Full Nephews',
    'ابن الأخ لأب': 'Paternal Nephew',
    'أبناء الأخ لأب': 'Paternal Nephews',
    'العم الشقيق': 'Full Paternal Uncle',
    'الأعمام الأشقاء': 'Full Paternal Uncles',
    'العم لأب': 'Paternal Uncle (Half)',
    'الأعمام لأب': 'Paternal Uncles (Half)',
    'ابن العم الشقيق': 'Full Paternal Cousin',
    'أبناء العم الشقيق': 'Full Paternal Cousins',
    'ابن العم لأب': 'Paternal Cousin (Half)',
    'أبناء العم لأب': 'Paternal Cousins (Half)',
    'بيت المال': 'Public Treasury (Bayt al-Mal)'
};

const HEIR_TYPE_TRANSLATIONS: Record<string, string> = {
    'فرض': 'Fixed Share (Fard)',
    'تعصيب': 'Residuary (Ta\'seeb)',
    'عول': 'Reduction (Awl)',
    'رد': 'Surplus Return (Radd)'
};

const MawarithCalculator: React.FC<{ cardBorderColor?: string }> = ({ cardBorderColor: propCardBorderColor }) => {
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
    
    const [estateValue, setEstateValue] = useState('');
    const [spouseType, setSpouseType] = useState<'none' | 'husband' | 'wife'>('none');
    const [wivesCount, setWivesCount] = useState(1);
    const [hasFather, setHasFather] = useState(false);
    const [hasMother, setHasMother] = useState(false);
    const [sonsCount, setSonsCount] = useState(0);
    const [daughtersCount, setDaughtersCount] = useState(0);
    const [grandsonsCount, setGrandsonsCount] = useState(0);
    const [granddaughtersCount, setGranddaughtersCount] = useState(0);
    const [hasPaternalGrandfather, setHasPaternalGrandfather] = useState(false);
    const [hasMaternalGrandmother, setHasMaternalGrandmother] = useState(false);
    const [hasPaternalGrandmother, setHasPaternalGrandmother] = useState(false);
    const [fullBrothersCount, setFullBrothersCount] = useState(0);
    const [fullSistersCount, setFullSistersCount] = useState(0);
    const [paternalBrothersCount, setPaternalBrothersCount] = useState(0);
    const [paternalSistersCount, setPaternalSistersCount] = useState(0);
    const [maternalSiblingsCount, setMaternalSiblingsCount] = useState(0);
    const [fullNephewsCount, setFullNephewsCount] = useState(0);
    const [paternalNephewsCount, setPaternalNephewsCount] = useState(0);
    const [fullUnclesCount, setFullUnclesCount] = useState(0);
    const [paternalUnclesCount, setPaternalUnclesCount] = useState(0);
    const [fullCousinsCount, setFullCousinsCount] = useState(0);
    const [paternalCousinsCount, setPaternalCousinsCount] = useState(0);

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: cardBorderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: theme.textColor,
        textAlign: isEn ? 'left' : 'right',
    };

    const clearAll = () => {
        setEstateValue('');
        setSpouseType('none'); setWivesCount(1);
        setHasFather(false); setHasMother(false);
        setSonsCount(0); setDaughtersCount(0);
        setGrandsonsCount(0); setGranddaughtersCount(0);
        setHasPaternalGrandfather(false); setHasMaternalGrandmother(false); setHasPaternalGrandmother(false);
        setFullBrothersCount(0); setFullSistersCount(0);
        setPaternalBrothersCount(0); setPaternalSistersCount(0);
        setMaternalSiblingsCount(0);
        setFullNephewsCount(0); setPaternalNephewsCount(0);
        setFullUnclesCount(0); setPaternalUnclesCount(0);
        setFullCousinsCount(0); setPaternalCousinsCount(0);
    };

    const hasSons = sonsCount > 0;
    const hasDaughters = daughtersCount > 0;
    const hasGrandsons = grandsonsCount > 0 && !hasSons;
    const hasGranddaughters = granddaughtersCount > 0 && !hasSons;
    
    const isMaleDescendant = hasSons || hasGrandsons;
    const isFemaleDescendant = hasDaughters || hasGranddaughters;
    const isChildrenPresent = isMaleDescendant || isFemaleDescendant;

    const isMaleAscendant = hasFather || (hasPaternalGrandfather && !hasFather);

    const showPaternalGrandfather = !hasFather;
    const showMaternalGrandmother = !hasMother;
    const showPaternalGrandmother = !hasMother && !hasFather;
    const showGrandsons = !hasSons;
    const showGranddaughters = !hasSons;

    const blockMaternalSiblings = isChildrenPresent || isMaleAscendant;
    const blockFullSiblings = isMaleDescendant || hasFather || hasPaternalGrandfather;
    const blockPaternalSiblings = blockFullSiblings || fullBrothersCount > 0 || (fullSistersCount > 0 && isFemaleDescendant);

    const showMaternalSiblings = !blockMaternalSiblings;
    const showFullSiblings = !blockFullSiblings;
    const showPaternalSiblings = !blockPaternalSiblings;

    const blockNephews = blockPaternalSiblings || fullBrothersCount > 0 || paternalBrothersCount > 0;
    const showFullNephews = !blockNephews;
    const showPaternalNephews = !blockNephews && fullNephewsCount === 0;

    const blockUncles = blockNephews || fullNephewsCount > 0 || paternalNephewsCount > 0;
    const showFullUncles = !blockUncles;
    const showPaternalUncles = !blockUncles && fullUnclesCount === 0;

    const blockCousins = blockUncles || fullUnclesCount > 0 || paternalUnclesCount > 0;
    const showFullCousins = !blockCousins;
    const showPaternalCousins = !blockCousins && fullCousinsCount === 0;

    const mawarithInput: MawarithInput = useMemo(() => ({
        estateValue,
        spouseType,
        wivesCount,
        hasFather,
        hasMother,
        sonsCount,
        daughtersCount,
        grandsonsCount,
        granddaughtersCount,
        hasPaternalGrandfather,
        hasMaternalGrandmother,
        hasPaternalGrandmother,
        fullBrothersCount,
        fullSistersCount,
        paternalBrothersCount,
        paternalSistersCount,
        maternalSiblingsCount,
        fullNephewsCount,
        paternalNephewsCount,
        fullUnclesCount,
        paternalUnclesCount,
        fullCousinsCount,
        paternalCousinsCount
    }), [
        estateValue, spouseType, wivesCount, hasFather, hasMother,
        sonsCount, daughtersCount, grandsonsCount, granddaughtersCount,
        hasPaternalGrandfather, hasMaternalGrandmother, hasPaternalGrandmother,
        fullBrothersCount, fullSistersCount, paternalBrothersCount, paternalSistersCount,
        maternalSiblingsCount, fullNephewsCount, paternalNephewsCount,
        fullUnclesCount, paternalUnclesCount, fullCousinsCount, paternalCousinsCount
    ]);

    const mawarithResults: HeirResult[] = useMemo(() => calculateMawarith(mawarithInput), [mawarithInput]);

    const renderNumberInput = (label: string, value: number, setter: (val: number) => void, hint?: string) => (
        <div className="flex flex-col">
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                <span className="text-xs font-bold opacity-80" style={{ color: theme.textColor }}>
                    {label}
                </span>
                {hint && (
                    <span className="text-[10px] opacity-70 font-normal leading-tight">
                        {hint}
                    </span>
                )}
            </div>
            <input 
                type="text" 
                inputMode="numeric" 
                pattern="[0-9]*" 
                min="0" 
                value={value || ''} 
                placeholder="0" 
                onChange={e => setter(parseInt(e.target.value) || 0)} 
                className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden text-center transition-all font-bold" 
                style={inputStyle} 
            />
        </div>
    );

    const renderCheckbox = (label: string, checked: boolean, setter: (val: boolean) => void, hint?: string) => (
        <label 
            className="flex items-center justify-between gap-2 cursor-pointer p-2.5 px-3 rounded-lg border transition-all" 
            style={{ 
                ...inputStyle, 
                borderColor: checked ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, 
                backgroundColor: checked ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor 
            }}
        >
            <div className="flex items-center gap-2">
                <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
                <span className="text-sm font-bold" style={{ color: theme.textColor }}>
                    {label}
                </span>
            </div>
            {hint && (
                <span className="text-[10px] opacity-70 font-normal leading-tight">
                    {hint}
                </span>
            )}
        </label>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="mawarith-header-actions" className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-scale-balanced text-primary"></i> 
                    <span>{isEn ? 'Islamic Inheritance Distribution (Mawarith)' : 'توزيع الميراث'}</span>
                </h2>
                <button id="btn-mawarith-reset" onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Estate Value */}
            <div id="mawarith-card-estate" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
                    <span className="text-sm font-bold opacity-90" style={{ color: theme.textColor }}>
                        {isEn ? 'Total Estate Value' : 'قيمة التركة الإجمالية'}
                    </span>
                    <span className="text-[11px] opacity-75 font-normal">
                        {isEn ? 'After funeral expenses, debts, and valid bequests (Wasiyyah)' : 'بعد تجهيز الميت وسداد ديونه ووصاياه'}
                    </span>
                </div>
                <input 
                    type="number" 
                    placeholder={isEn ? 'Enter estate amount' : 'أدخل المبلغ'} 
                    value={estateValue} 
                    onChange={e => setEstateValue(e.target.value)} 
                    className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden text-center font-bold text-lg transition-all" 
                    style={inputStyle} 
                />
            </div>

            {/* Relatives Inputs */}
            <div className="space-y-4">
                {/* Parents */}
                <div id="mawarith-card-parents" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>
                        {isEn ? 'Ascendants (Parents & Grandparents)' : 'الأصول (الآباء والأجداد)'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        {renderCheckbox(isEn ? 'Father' : 'الأب', hasFather, setHasFather, isEn ? 'Blocks grandfathers and siblings' : 'يحجب الأجداد والإخوة')}
                        {renderCheckbox(isEn ? 'Mother' : 'الأم', hasMother, setHasMother, isEn ? 'Blocks grandmothers' : 'تحجب الجدات')}
                        {showPaternalGrandfather && renderCheckbox(isEn ? 'Paternal Grandfather' : 'الجد لأب', hasPaternalGrandfather, setHasPaternalGrandfather)}
                        {showMaternalGrandmother && renderCheckbox(isEn ? 'Maternal Grandmother' : 'الجدة لأم', hasMaternalGrandmother, setHasMaternalGrandmother)}
                        {showPaternalGrandmother && renderCheckbox(isEn ? 'Paternal Grandmother' : 'الجدة لأب', hasPaternalGrandmother, setHasPaternalGrandmother)}
                    </div>
                </div>

                {/* Spouses */}
                <div id="mawarith-card-spouses" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>
                        {isEn ? 'Spouses' : 'الزوج والزوجة'}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'none' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'none' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'none'} onChange={() => setSpouseType('none')} className="w-4 h-4 accent-primary cursor-pointer" />
                            <span style={{ color: theme.textColor }}>{isEn ? 'None' : 'لا يوجد'}</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'husband' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'husband' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'husband'} onChange={() => setSpouseType('husband')} className="w-4 h-4 accent-primary cursor-pointer" />
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: theme.textColor }}>{isEn ? 'Husband' : 'زوج'}</span>
                                <span className="text-[10px] opacity-70 font-normal leading-tight">{isEn ? 'Inherits 1/2 or 1/4' : 'يرث النصف أو الربع'}</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'wife' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'wife' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'wife'} onChange={() => setSpouseType('wife')} className="w-4 h-4 accent-primary cursor-pointer" />
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: theme.textColor }}>{isEn ? 'Wife' : 'زوجة'}</span>
                                <span className="text-[10px] opacity-70 font-normal leading-tight">{isEn ? 'Inherits 1/4 or 1/8' : 'ترث الربع أو الثمن'}</span>
                            </div>
                        </label>
                    </div>
                    {spouseType === 'wife' && (
                        <div className="mt-3 flex items-center gap-3">
                            <label className="text-xs font-bold opacity-80" style={{ color: theme.textColor }}>
                                {isEn ? 'Number of Wives:' : 'عدد الزوجات:'}
                            </label>
                            <input type="number" min="1" max="4" value={wivesCount} onChange={e => setWivesCount(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} className="w-16 p-1.5 rounded-lg border text-center font-bold" style={inputStyle} />
                        </div>
                    )}
                </div>

                {/* Descendants */}
                <div id="mawarith-card-descendants" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>
                        {isEn ? 'Descendants (Children & Grandchildren)' : 'الفروع (الأبناء وبناتهم)'}
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {renderNumberInput(isEn ? 'Sons (Male)' : 'الأبناء (ذكور)', sonsCount, setSonsCount)}
                        {renderNumberInput(isEn ? 'Daughters (Female)' : 'البنات (إناث)', daughtersCount, setDaughtersCount)}
                    </div>
                    {(showGrandsons || showGranddaughters) && (
                        <div className="grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                            {showGrandsons && renderNumberInput(isEn ? 'Grandsons (Sons of Son)' : 'أبناء الابن', grandsonsCount, setGrandsonsCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن المباشر')}
                            {showGranddaughters && renderNumberInput(isEn ? 'Granddaughters (Daughters of Son)' : 'بنات الابن', granddaughtersCount, setGranddaughtersCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن المباشر')}
                        </div>
                    )}
                </div>

                {/* Siblings */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div id="mawarith-card-siblings" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>
                            {isEn ? 'Collaterals (Brothers & Sisters)' : 'الحواشي (الإخوة والأخوات)'}
                        </h3>
                        <div className="space-y-3">
                            {showFullSiblings && (
                                <div className="grid grid-cols-2 gap-3">
                                    {renderNumberInput(isEn ? 'Full Brothers' : 'الإخوة الأشقاء', fullBrothersCount, setFullBrothersCount)}
                                    {renderNumberInput(isEn ? 'Full Sisters' : 'الأخوات الشقيقات', fullSistersCount, setFullSistersCount)}
                                </div>
                            )}
                            {showPaternalSiblings && (
                                <div className="grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                                    {renderNumberInput(isEn ? 'Paternal Brothers (Half)' : 'الإخوة لأب', paternalBrothersCount, setPaternalBrothersCount, isEn ? 'Blocked by full brother' : 'يحجبهم الأخ الشقيق')}
                                    {renderNumberInput(isEn ? 'Paternal Sisters (Half)' : 'الأخوات لأب', paternalSistersCount, setPaternalSistersCount, isEn ? 'Blocked by full brother or 2+ full sisters' : 'يحجبهن الأخ الشقيق أو استيفاء الشقيقات للثلثين')}
                                </div>
                            )}
                            {showMaternalSiblings && (
                                <div className="border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                                    {renderNumberInput(isEn ? 'Maternal Siblings (Half)' : 'الإخوة والأخوات لأم', maternalSiblingsCount, setMaternalSiblingsCount, isEn ? 'Inherit equally between male and female' : 'يرثون بالفرض بالسوية بين الذكر والأنثى')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Extended Heirs */}
                {(showFullNephews || showPaternalNephews || showFullUncles || showPaternalUncles || showFullCousins || showPaternalCousins) && (
                    <div id="mawarith-card-extended" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>
                            {isEn ? 'Other Agnatic Heirs (Asabah)' : 'العصبات الأخرى (أبناء الإخوة والأعمام)'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {showFullNephews && renderNumberInput(isEn ? 'Full Nephews (Male)' : 'أبناء الأخ الشقيق (ذكور)', fullNephewsCount, setFullNephewsCount)}
                            {showPaternalNephews && renderNumberInput(isEn ? 'Paternal Nephews (Male)' : 'أبناء الأخ لأب (ذكور)', paternalNephewsCount, setPaternalNephewsCount)}
                            {showFullUncles && renderNumberInput(isEn ? 'Full Paternal Uncles' : 'الأعمام الأشقاء', fullUnclesCount, setFullUnclesCount)}
                            {showPaternalUncles && renderNumberInput(isEn ? 'Paternal Uncles (Half)' : 'الأعمام لأب', paternalUnclesCount, setPaternalUnclesCount)}
                            {showFullCousins && renderNumberInput(isEn ? 'Full Male Cousins' : 'أبناء العم الشقيق (ذكور)', fullCousinsCount, setFullCousinsCount)}
                            {showPaternalCousins && renderNumberInput(isEn ? 'Paternal Male Cousins' : 'أبناء العم لأب (ذكور)', paternalCousinsCount, setPaternalCousinsCount)}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Table */}
            {mawarithResults.length > 0 && (
                <div id="mawarith-card-results" className="themed-card p-5 rounded-2xl shadow-lg animate-fade-in" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-between" style={{ color: theme.textColor }}>
                        <span>{isEn ? 'Inheritance Distribution Table' : 'جدول توزيع الميراث'}</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-normal">
                            {isEn ? `Total Heirs: ${mawarithResults.length}` : `إجمالي الورثة: ${mawarithResults.length}`}
                        </span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className={`w-full ${isEn ? 'text-left' : 'text-right'} text-sm`}>
                            <thead>
                                <tr className="border-b opacity-70" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)', color: theme.textColor }}>
                                    <th className="py-2.5 font-bold">{isEn ? 'Heir' : 'الوارث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Share Type' : 'نوع الإرث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Percentage' : 'النسبة'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Amount Due' : 'المبلغ المستحق'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: theme.isOriginal ? '#f3f4f6' : 'rgba(255,255,255,0.05)' }}>
                                {mawarithResults.map((heir, idx) => (
                                    <tr key={idx} style={{ color: theme.textColor }}>
                                        <td className="py-3 font-bold">
                                            {isEn ? (HEIR_NAME_TRANSLATIONS[heir.name] || heir.name) : heir.name}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${heir.type === 'فرض' ? 'bg-blue-500/10 text-blue-500' : heir.type === 'تعصيب' ? 'bg-emerald-500/10 text-emerald-500' : heir.type === 'عول' ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {isEn ? (HEIR_TYPE_TRANSLATIONS[heir.type] || heir.type) : heir.type}
                                            </span>
                                        </td>
                                        <td className="py-3 font-sans opacity-80" dir="ltr">{(heir.share * 100).toFixed(2)}%</td>
                                        <td className="py-3 font-bold text-primary font-sans">{heir.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MawarithCalculator;
