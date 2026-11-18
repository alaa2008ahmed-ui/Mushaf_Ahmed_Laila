import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw, Check } from 'lucide-react';
import { getCalculator3DStyles } from '../../utils/calculator3DStyles';

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
    const { theme, themeKey, isNightMode, homeThemeVariant } = useTheme();
    const s3d = getCalculator3DStyles(theme, themeKey, isNightMode, homeThemeVariant);
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
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5 px-1">
                <span className="text-xs font-bold">
                    {label}
                </span>
                {hint && (
                    <span className="text-[10px] font-normal leading-tight opacity-80" style={{ color: s3d.subtextColor }}>
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
                className={`app-3d-recessed-field border-0 w-full p-3 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:outline-hidden text-center transition-all font-bold text-sm tabular-nums ${s3d.recessedInputClass}`} 
            />
        </div>
    );

    const renderCheckbox = (label: string, checked: boolean, setter: (val: boolean) => void, hint?: string) => (
        <button
            type="button"
            onClick={() => setter(!checked)}
            className={`app-page-card border-0 flex items-center justify-between gap-2 p-3.5 rounded-2xl transition-all cursor-pointer text-start w-full ${s3d.surfaceCardClass}`}
            style={checked ? { backgroundColor: s3d.activeTintBg } : undefined}
        >
            <div className="flex items-center gap-2.5 min-w-0">
                <div 
                    className={`app-3d-checkbox ${checked ? 'app-3d-checkbox-checked' : ''} w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-all`}
                    style={{
                        backgroundColor: checked ? s3d.primaryColor : 'rgba(150, 150, 150, 0.22)',
                        color: checked ? s3d.btnTextColor : 'transparent'
                    }}
                >
                    <Check size={12} strokeWidth={3} />
                </div>
                <span className="text-xs sm:text-sm font-bold truncate" style={{ color: checked ? s3d.primaryColor : s3d.textColor }}>
                    {label}
                </span>
            </div>
            {hint && (
                <span className="text-[10px] opacity-75 font-normal leading-tight truncate shrink-0 max-w-[45%]" style={{ color: s3d.subtextColor }}>
                    {hint}
                </span>
            )}
        </button>
    );

    return (
        <div className="space-y-4 animate-fade-in" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="mawarith-header-actions" className="flex justify-between items-center mb-2 gap-2 overflow-visible">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2.5" style={{ color: s3d.textColor }}>
                    <span className={`app-3d-badge w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                        <i className="fa-solid fa-scale-balanced" style={{ color: s3d.primaryColor }}></i>
                    </span>
                    <span>{isEn ? 'Islamic Inheritance Distribution (Mawarith)' : 'توزيع الميراث'}</span>
                </h2>
                <button 
                    id="btn-mawarith-reset" 
                    onClick={clearAll} 
                    className={`app-page-card border-0 flex items-center gap-1.5 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 px-3.5 py-2 rounded-xl transition-all cursor-pointer shrink-0 ${s3d.surfaceCardClass}`}
                >
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* Estate Value Card */}
            <div 
                id="mawarith-card-estate" 
                className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
            >
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2.5 px-1">
                    <span className="text-sm font-bold">
                        {isEn ? 'Total Estate Value' : 'قيمة التركة الإجمالية'}
                    </span>
                    <span className="text-[11px] opacity-80 font-normal" style={{ color: s3d.subtextColor }}>
                        {isEn ? 'After funeral expenses, debts, and valid bequests (Wasiyyah)' : 'بعد تجهيز الميت وسداد ديونه ووصاياه'}
                    </span>
                </div>
                <input 
                    type="number" 
                    placeholder={isEn ? 'Enter estate amount' : 'أدخل المبلغ'} 
                    value={estateValue} 
                    onChange={e => setEstateValue(e.target.value)} 
                    className={`app-3d-recessed-field border-0 w-full p-3.5 rounded-2xl focus:ring-2 focus:ring-primary/40 focus:outline-hidden text-center font-bold text-lg tabular-nums transition-all ${s3d.recessedInputClass}`} 
                />
            </div>

            {/* Relatives Inputs */}
            <div className="space-y-4">
                {/* Parents */}
                <div 
                    id="mawarith-card-parents" 
                    className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
                >
                    <h3 className="font-bold mb-3.5 text-sm flex items-center gap-2.5">
                        <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                            <i className="fa-solid fa-users text-sm" style={{ color: s3d.primaryColor }}></i>
                        </span>
                        <span>{isEn ? 'Ascendants (Parents & Grandparents)' : 'الأصول (الآباء والأجداد)'}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-visible pb-1">
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
                    className={`app-page-card border-0 p-5 rounded-3xl transition-all overflow-visible ${s3d.surfaceCardClass}`}
                >
                    <h3 className="font-bold mb-3.5 text-sm flex items-center gap-2.5">
                        <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                            <i className="fa-solid fa-ring text-sm" style={{ color: s3d.primaryColor }}></i>
                        </span>
                        <span>{isEn ? 'Spouses' : 'الزوج والزوجة'}</span>
                    </h3>
                    <div className="grid grid-cols-3 gap-2.5 overflow-visible pb-1">
                        <button
                            type="button"
                            onClick={() => setSpouseType('none')}
                            className={`app-page-card border-0 p-3 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                spouseType === 'none'
                                    ? 'font-black'
                                    : `font-bold ${s3d.surfaceCardClass}`
                            }`}
                            style={spouseType === 'none' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            <span className="text-xs sm:text-sm">{isEn ? 'None' : 'لا يوجد'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSpouseType('husband')}
                            className={`app-page-card border-0 p-3 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                spouseType === 'husband'
                                    ? 'font-black'
                                    : `font-bold ${s3d.surfaceCardClass}`
                            }`}
                            style={spouseType === 'husband' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            <span className="text-xs sm:text-sm">{isEn ? 'Husband' : 'زوج'}</span>
                            <span className="text-[10px] opacity-80 font-normal leading-tight mt-0.5">{isEn ? '1/2 or 1/4' : 'النصف أو الربع'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSpouseType('wife')}
                            className={`app-page-card border-0 p-3 rounded-2xl transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                                spouseType === 'wife'
                                    ? 'font-black'
                                    : `font-bold ${s3d.surfaceCardClass}`
                            }`}
                            style={spouseType === 'wife' ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                        >
                            <span className="text-xs sm:text-sm">{isEn ? 'Wife' : 'زوجة'}</span>
                            <span className="text-[10px] opacity-80 font-normal leading-tight mt-0.5">{isEn ? '1/4 or 1/8' : 'الربع أو الثمن'}</span>
                        </button>
                    </div>

                    {spouseType === 'wife' && (
                        <div className="app-inner-3d-box border-0 mt-3.5 flex items-center justify-between p-3.5 rounded-2xl overflow-visible" style={{ backgroundColor: s3d.softResultBg }}>
                            <label className="text-xs font-bold">
                                {isEn ? 'Number of Wives:' : 'عدد الزوجات:'}
                            </label>
                            <div className="flex items-center gap-2 overflow-visible pb-1">
                                {[1, 2, 3, 4].map(num => {
                                    const active = wivesCount === num;
                                    return (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setWivesCount(num)}
                                            className={`app-page-card border-0 w-9 h-9 rounded-xl text-xs transition-all cursor-pointer tabular-nums ${
                                                active
                                                    ? 'font-black'
                                                    : `font-bold ${s3d.surfaceCardClass}`
                                            }`}
                                            style={active ? { backgroundColor: s3d.primaryColor, color: s3d.btnTextColor } : undefined}
                                        >
                                            {num}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Descendants */}
                <div 
                    id="mawarith-card-descendants" 
                    className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
                >
                    <h3 className="font-bold mb-3.5 text-sm flex items-center gap-2.5">
                        <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                            <i className="fa-solid fa-child text-sm" style={{ color: s3d.primaryColor }}></i>
                        </span>
                        <span>{isEn ? 'Descendants (Children & Grandchildren)' : 'الفروع (الأبناء وبناتهم)'}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {renderNumberInput(isEn ? 'Sons (Male)' : 'الأبناء (ذكور)', sonsCount, setSonsCount)}
                        {renderNumberInput(isEn ? 'Daughters (Female)' : 'البنات (إناث)', daughtersCount, setDaughtersCount)}
                    </div>
                    {(showGrandsons || showGranddaughters) && (
                        <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${s3d.dividerClass}`}>
                            {showGrandsons && renderNumberInput(isEn ? 'Grandsons' : 'أبناء الابن', grandsonsCount, setGrandsonsCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن')}
                            {showGranddaughters && renderNumberInput(isEn ? 'Granddaughters' : 'بنات الابن', granddaughtersCount, setGranddaughtersCount, isEn ? 'Blocked by direct son' : 'يحجبهم وجود الابن')}
                        </div>
                    )}
                </div>

                {/* Siblings */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div 
                        id="mawarith-card-siblings" 
                        className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
                    >
                        <h3 className="font-bold mb-3.5 text-sm flex items-center gap-2.5">
                            <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                                <i className="fa-solid fa-people-arrows text-sm" style={{ color: s3d.primaryColor }}></i>
                            </span>
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
                                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${s3d.dividerClass}`}>
                                    {renderNumberInput(isEn ? 'Paternal Brothers' : 'الإخوة لأب', paternalBrothersCount, setPaternalBrothersCount, isEn ? 'Blocked by full brother' : 'يحجبهم الأخ الشقيق')}
                                    {renderNumberInput(isEn ? 'Paternal Sisters' : 'الأخوات لأب', paternalSistersCount, setPaternalSistersCount, isEn ? 'Blocked by brother/sisters' : 'يحجبهن الأخ الشقيق')}
                                </div>
                            )}
                            {showMaternalSiblings && (
                                <div className={`pt-3 border-t ${s3d.dividerClass}`}>
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
                        className={`app-page-card border-0 p-5 rounded-3xl transition-all ${s3d.surfaceCardClass}`}
                    >
                        <h3 className="font-bold mb-3.5 text-sm flex items-center gap-2.5">
                            <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                                <i className="fa-solid fa-diagram-project text-sm" style={{ color: s3d.primaryColor }}></i>
                            </span>
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
                    className={`app-page-card border-0 p-5 rounded-3xl animate-fade-in transition-all ${s3d.surfaceCardClass}`}
                >
                    <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2.5">
                            <span className={`app-3d-badge w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}>
                                <i className="fa-solid fa-list-check text-sm" style={{ color: s3d.primaryColor }}></i>
                            </span>
                            <span>{isEn ? 'Inheritance Distribution Table' : 'جدول توزيع الميراث'}</span>
                        </span>
                        <span 
                            className={`app-3d-badge text-xs px-3 py-1.5 rounded-xl font-bold tabular-nums ${s3d.isBlackTheme ? 'bg-white/10' : 'bg-slate-100 dark:bg-white/10'}`}
                            style={{ color: s3d.primaryColor }}
                        >
                            {isEn ? `Total Heirs: ${mawarithResults.length}` : `إجمالي الورثة: ${mawarithResults.length}`}
                        </span>
                    </h3>

                    <div className="app-inner-3d-box border-0 p-3.5 rounded-2xl overflow-x-auto" style={{ backgroundColor: s3d.softResultBg }}>
                        <table className={`w-full ${isEn ? 'text-left' : 'text-right'} text-sm`}>
                            <thead>
                                <tr className={`border-b ${s3d.dividerClass} opacity-75`}>
                                    <th className="py-2.5 font-bold">{isEn ? 'Heir' : 'الوارث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Share Type' : 'نوع الإرث'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Percentage' : 'النسبة'}</th>
                                    <th className="py-2.5 font-bold">{isEn ? 'Amount Due' : 'المبلغ المستحق'}</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${s3d.isBlackTheme ? 'divide-white/10' : 'divide-slate-200/60 dark:divide-white/10'}`}>
                                {mawarithResults.map((heir, idx) => (
                                    <tr key={idx}>
                                        <td className="py-3 font-bold">
                                            {isEn ? (HEIR_NAME_TRANSLATIONS[heir.name] || heir.name) : heir.name}
                                        </td>
                                        <td className="py-3">
                                            <span className={`app-3d-badge border-0 inline-block px-2.5 py-1 rounded-xl text-xs font-bold ${
                                                heir.type === 'فرض' 
                                                    ? 'bg-blue-500/12 text-blue-600 dark:text-blue-400' 
                                                    : heir.type === 'تعصيب' 
                                                        ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400' 
                                                        : heir.type === 'عول' 
                                                            ? 'bg-purple-500/12 text-purple-600 dark:text-purple-400' 
                                                            : 'bg-amber-500/12 text-amber-600 dark:text-amber-400'
                                            }`}>
                                                {isEn ? (HEIR_TYPE_TRANSLATIONS[heir.type] || heir.type) : heir.type}
                                            </span>
                                        </td>
                                        <td className="py-3 font-sans opacity-85 tabular-nums" dir="ltr">{(heir.share * 100).toFixed(2)}%</td>
                                        <td className="py-3 font-bold font-sans tabular-nums" style={{ color: s3d.primaryColor }}>
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
