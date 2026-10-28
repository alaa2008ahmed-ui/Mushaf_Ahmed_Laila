import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, Check } from 'lucide-react';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

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

const MawarithCalculator: React.FC<{ cardBorderColor?: string }> = () => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { language } = useLanguage();
    const isEn = language === 'en';
    
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
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                <span className="text-xs font-bold" style={{ color: tokens.textColor }}>
                    {label}
                </span>
                {hint && (
                    <span className="text-[10px] font-normal leading-tight opacity-75" style={{ color: tokens.subtextColor }}>
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
                className="w-full p-2.5 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/40 focus:outline-hidden text-center transition-all font-bold text-sm" 
                style={{ color: tokens.textColor }}
            />
        </div>
    );

    const renderCheckbox = (label: string, checked: boolean, setter: (val: boolean) => void, hint?: string) => (
        <button
            type="button"
            onClick={() => setter(!checked)}
            className="flex items-center justify-between gap-2 p-3 rounded-xl transition-all cursor-pointer border-0 text-start w-full"
            style={{ 
                backgroundColor: checked ? hexToRgba(tokens.primaryColor, 0.12) : 'rgba(150, 150, 150, 0.08)',
            }}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div 
                    className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors"
                    style={{
                        backgroundColor: checked ? tokens.primaryColor : 'rgba(150, 150, 150, 0.2)',
                        color: checked ? '#FFFFFF' : 'transparent'
                    }}
                >
                    <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs sm:text-sm font-bold truncate" style={{ color: checked ? tokens.primaryColor : tokens.textColor }}>
                    {label}
                </span>
            </div>
            {hint && (
                <span className="text-[10px] opacity-70 font-normal leading-tight truncate shrink-0 max-w-[45%]" style={{ color: tokens.subtextColor }}>
                    {hint}
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-4 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="mawarith-header-actions" className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-scale-balanced" style={{ color: tokens.primaryColor }}></i> 
                    <span>{isEn ? 'Islamic Inheritance Distribution (Mawarith)' : 'توزيع الميراث'}</span>
                </h2>
                <button 
                    id="btn-mawarith-reset" 
                    onClick={clearAll} 
                    className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors cursor-pointer border-0"
                >
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Estate Value Card */}
            <div 
                id="mawarith-card-estate" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
                    <span className="text-sm font-bold" style={{ color: tokens.textColor }}>
                        {isEn ? 'Total Estate Value' : 'قيمة التركة الإجمالية'}
                    </span>
                    <span className="text-[11px] opacity-75 font-normal" style={{ color: tokens.subtextColor }}>
                        {isEn ? 'After funeral expenses, debts, and valid bequests (Wasiyyah)' : 'بعد تجهيز الميت وسداد ديونه ووصاياه'}
                    </span>
                </div>
                <input 
                    type="number" 
                    placeholder={isEn ? 'Enter estate amount' : 'أدخل المبلغ'} 
                    value={estateValue} 
                    onChange={e => setEstateValue(e.target.value)} 
                    className="w-full p-3.5 rounded-xl border-0 bg-slate-100 dark:bg-zinc-800 focus:ring-2 focus:ring-primary/40 focus:outline-hidden text-center font-bold text-lg transition-all" 
                    style={{ color: tokens.textColor }}
                />
            </div>

            {/* Relatives Inputs */}
            <div className="space-y-4">
                {/* Parents */}
                <div 
                    id="mawarith-card-parents" 
                    className="p-5 rounded-[18px] border-0"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: tokens.textColor }}>
                        <i className="fa-solid fa-users" style={{ color: tokens.primaryColor }}></i>
                        <span>{isEn ? 'Ascendants (Parents & Grandparents)' : 'الأصول (الآباء والأجداد)'}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {renderCheckbox(isEn ? 'Father' : 'الأب', hasFather, setHasFather, isEn ? 'Blocks grandfathers and siblings' : 'يحجب الأجداد والإخوة')}
                        {renderCheckbox(isEn ? 'Mother' : 'الأم', hasMother, setHasMother, isEn ? 'Blocks grandmothers' : 'تحجب الجدات')}
                        {showPaternalGrandfather && renderCheckbox(isEn ? 'Paternal Grandfather' : 'الجد لأب', hasPaternalGrandfather, setHasPaternalGrandfather)}
                        {showMaternalGrandmother && renderCheckbox(isEn ? 'Maternal Grandmother' : 'الجدة لأم', hasMaternalGrandmother, setHasMaternalGrandmother)}
                        {showPaternalGrandmother && renderCheckbox(isEn ? 'Paternal Grandmother' : 'الجدة لأب', hasPaternalGrandmother, setHasPaternalGrandmother)}
                    </div>
                </div>

                {/* Spouses */}
                <div 
                    id="mawarith-card-spouses" 
                    className="p-5 rounded-[18px] border-0"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: tokens.textColor }}>
                        <i className="fa-solid fa-ring" style={{ color: tokens.primaryColor }}></i>
                        <span>{isEn ? 'Spouses' : 'الزوج والزوجة'}</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5">
                        <button
                            type="button"
                            onClick={() => setSpouseType('none')}
                            className="p-3 rounded-xl transition-all cursor-pointer border-0 flex flex-col items-center justify-center text-center"
                            style={{ 
                                backgroundColor: spouseType === 'none' ? hexToRgba(tokens.primaryColor, 0.12) : 'rgba(150, 150, 150, 0.08)',
                                color: spouseType === 'none' ? tokens.primaryColor : tokens.textColor
                            }}
                        >
                            <span className="font-bold text-xs sm:text-sm">{isEn ? 'None' : 'لا يوجد'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSpouseType('husband')}
                            className="p-3 rounded-xl transition-all cursor-pointer border-0 flex flex-col items-center justify-center text-center"
                            style={{ 
                                backgroundColor: spouseType === 'husband' ? hexToRgba(tokens.primaryColor, 0.12) : 'rgba(150, 150, 150, 0.08)',
                                color: spouseType === 'husband' ? tokens.primaryColor : tokens.textColor
                            }}
                        >
                            <span className="font-bold text-xs sm:text-sm">{isEn ? 'Husband' : 'زوج'}</span>
                            <span className="text-[10px] opacity-70 font-normal leading-tight mt-0.5">{isEn ? '1/2 or 1/4' : 'النصف أو الربع'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSpouseType('wife')}
                            className="p-3 rounded-xl transition-all cursor-pointer border-0 flex flex-col items-center justify-center text-center"
                            style={{ 
                                backgroundColor: spouseType === 'wife' ? hexToRgba(tokens.primaryColor, 0.12) : 'rgba(150, 150, 150, 0.08)',
                                color: spouseType === 'wife' ? tokens.primaryColor : tokens.textColor
                            }}
                        >
                            <span className="font-bold text-xs sm:text-sm">{isEn ? 'Wife' : 'زوجة'}</span>
                            <span className="text-[10px] opacity-70 font-normal leading-tight mt-0.5">{isEn ? '1/4 or 1/8' : 'الربع أو الثمن'}</span>
                        </button>
                    </div>

                    {spouseType === 'wife' && (
                        <div className="mt-3.5 flex items-center justify-between p-3 rounded-xl bg-slate-100/70 dark:bg-zinc-800/60">
                            <label className="text-xs font-bold" style={{ color: tokens.textColor }}>
                                {isEn ? 'Number of Wives:' : 'عدد الزوجات:'}
                            </label>
                            <div className="flex items-center gap-1.5">
                                {[1, 2, 3, 4].map(num => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setWivesCount(num)}
                                        className="w-8 h-8 rounded-lg font-bold text-xs transition-all cursor-pointer border-0"
                                        style={{
                                            backgroundColor: wivesCount === num ? tokens.primaryColor : 'transparent',
                                            color: wivesCount === num ? '#FFFFFF' : tokens.textColor
                                        }}
                                    >
                                        {num}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Descendants */}
                <div 
                    id="mawarith-card-descendants" 
                    className="p-5 rounded-[18px] border-0"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: tokens.textColor }}>
                        <i className="fa-solid fa-child" style={{ color: tokens.primaryColor }}></i>
                        <span>{isEn ? 'Descendants (Children & Grandchildren)' : 'الفروع (الأبناء وبناتهم)'}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {renderNumberInput(isEn ? 'Sons (Male)' : 'الأبناء (ذكور)', sonsCount, setSonsCount)}
                        {renderNumberInput(isEn ? 'Daughters (Female)' : 'البنات (إناث)', daughtersCount, setDaughtersCount)}
                    </div>
                    {(showGrandsons || showGranddaughters) && (
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                            {showGrandsons && renderNumberInput(isEn ? 'Grandsons' : 'أبناء الابن', grandsonsCount, setGrandsonsCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن')}
                            {showGranddaughters && renderNumberInput(isEn ? 'Granddaughters' : 'بنات الابن', granddaughtersCount, setGranddaughtersCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن')}
                        </div>
                    )}
                </div>

                {/* Siblings */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div 
                        id="mawarith-card-siblings" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: tokens.textColor }}>
                            <i className="fa-solid fa-people-arrows" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? 'Collaterals (Brothers & Sisters)' : 'الحواشي (الإخوة والأخوات)'}</span>
                        </h3>
                        <div className="space-y-3">
                            {showFullSiblings && (
                                <div className="grid grid-cols-2 gap-3">
                                    {renderNumberInput(isEn ? 'Full Brothers' : 'الإخوة الأشقاء', fullBrothersCount, setFullBrothersCount)}
                                    {renderNumberInput(isEn ? 'Full Sisters' : 'الأخوات الشقيقات', fullSistersCount, setFullSistersCount)}
                                </div>
                            )}
                            {showPaternalSiblings && (
                                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-zinc-800">
                                    {renderNumberInput(isEn ? 'Paternal Brothers' : 'الإخوة لأب', paternalBrothersCount, setPaternalBrothersCount, isEn ? 'Blocked by full brother' : 'يحجبهم الأخ الشقيق')}
                                    {renderNumberInput(isEn ? 'Paternal Sisters' : 'الأخوات لأب', paternalSistersCount, setPaternalSistersCount, isEn ? 'Blocked by brother/sisters' : 'يحجبهن الأخ الشقيق')}
                                </div>
                            )}
                            {showMaternalSiblings && (
                                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800">
                                    {renderNumberInput(isEn ? 'Maternal Siblings' : 'الإخوة والأخوات لأم', maternalSiblingsCount, setMaternalSiblingsCount, isEn ? 'Inherit equally' : 'يرثون بالسوية')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Extended Heirs */}
                {(showFullNephews || showPaternalNephews || showFullUncles || showPaternalUncles || showFullCousins || showPaternalCousins) && (
                    <div 
                        id="mawarith-card-extended" 
                        className="p-5 rounded-[18px] border-0"
                        style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                    >
                        <h3 className="font-bold mb-3 text-sm flex items-center gap-2" style={{ color: tokens.textColor }}>
                            <i className="fa-solid fa-diagram-project" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? 'Other Agnatic Heirs (Asabah)' : 'العصبات الأخرى (أبناء الإخوة والأعمام)'}</span>
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {showFullNephews && renderNumberInput(isEn ? 'Full Nephews' : 'أبناء الأخ الشقيق', fullNephewsCount, setFullNephewsCount)}
                            {showPaternalNephews && renderNumberInput(isEn ? 'Paternal Nephews' : 'أبناء الأخ لأب', paternalNephewsCount, setPaternalNephewsCount)}
                            {showFullUncles && renderNumberInput(isEn ? 'Full Paternal Uncles' : 'الأعمام الأشقاء', fullUnclesCount, setFullUnclesCount)}
                            {showPaternalUncles && renderNumberInput(isEn ? 'Paternal Uncles' : 'الأعمام لأب', paternalUnclesCount, setPaternalUnclesCount)}
                            {showFullCousins && renderNumberInput(isEn ? 'Full Male Cousins' : 'أبناء العم الشقيق', fullCousinsCount, setFullCousinsCount)}
                            {showPaternalCousins && renderNumberInput(isEn ? 'Paternal Male Cousins' : 'أبناء العم لأب', paternalCousinsCount, setPaternalCousinsCount)}
                        </div>
                    </div>
                )}
            </div>

            {/* Results Table */}
            {mawarithResults.length > 0 && (
                <div 
                    id="mawarith-card-results" 
                    className="p-5 rounded-[18px] border-0 animate-fade-in"
                    style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
                >
                    <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center justify-between" style={{ color: tokens.textColor }}>
                        <span className="flex items-center gap-2">
                            <i className="fa-solid fa-list-check" style={{ color: tokens.primaryColor }}></i>
                            <span>{isEn ? 'Inheritance Distribution Table' : 'جدول توزيع الميراث'}</span>
                        </span>
                        <span 
                            className="text-xs px-3 py-1 rounded-full font-bold"
                            style={{ 
                                backgroundColor: hexToRgba(tokens.primaryColor, 0.12),
                                color: tokens.primaryColor
                            }}
                        >
                            {isEn ? `Total Heirs: ${mawarithResults.length}` : `إجمالي الورثة: ${mawarithResults.length}`}
                        </span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className={`w-full ${isEn ? 'text-left' : 'text-right'} text-sm`}>
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-zinc-800 opacity-70" style={{ color: tokens.textColor }}>
                                    <th className="py-2.5 font-bold">{isEn ? 'Heir' : 'الوارث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Share Type' : 'نوع الإرث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Percentage' : 'النسبة'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Amount Due' : 'المبلغ المستحق'}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                                {mawarithResults.map((heir, idx) => (
                                    <tr key={idx} style={{ color: tokens.textColor }}>
                                        <td className="py-3 font-bold">
                                            {isEn ? (HEIR_NAME_TRANSLATIONS[heir.name] || heir.name) : heir.name}
                                        </td>
                                        <td className="py-3">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                                heir.type === 'فرض' 
                                                    ? 'bg-blue-500/10 text-blue-500' 
                                                    : heir.type === 'تعصيب' 
                                                        ? 'bg-emerald-500/10 text-emerald-500' 
                                                        : heir.type === 'عول' 
                                                            ? 'bg-purple-500/10 text-purple-500' 
                                                            : 'bg-amber-500/10 text-amber-500'
                                            }`}>
                                                {isEn ? (HEIR_TYPE_TRANSLATIONS[heir.type] || heir.type) : heir.type}
                                            </span>
                                        </td>
                                        <td className="py-3 font-sans opacity-80" dir="ltr">{(heir.share * 100).toFixed(2)}%</td>
                                        <td className="py-3 font-bold font-sans" style={{ color: tokens.primaryColor }}>
                                            {heir.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                                        </td>
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
