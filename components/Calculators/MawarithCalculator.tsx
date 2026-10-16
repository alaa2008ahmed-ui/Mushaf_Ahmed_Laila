import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';
import { RefreshCw } from 'lucide-react';

const MawarithCalculator: React.FC<{ cardBorderColor?: string }> = ({ cardBorderColor: propCardBorderColor }) => {
    const { theme, themeKey } = useTheme();
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
                <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} className="w-4 h-4 accent-primary" />
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
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-scale-balanced text-primary"></i> توزيع الميراث
                </h2>
                <button onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCw size={14} /> إعادة ضبط
                </button>
            </div>

            {/* Estate Value */}
            <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className="flex flex-wrap items-baseline justify-between gap-1 mb-2">
                    <span className="text-sm font-bold opacity-90" style={{ color: theme.textColor }}>
                        قيمة التركة الإجمالية
                    </span>
                    <span className="text-[11px] opacity-75 font-normal">
                        بعد تجهيز الميت وسداد ديونه ووصاياه
                    </span>
                </div>
                <input 
                    type="number" 
                    placeholder="أدخل المبلغ" 
                    value={estateValue} 
                    onChange={e => setEstateValue(e.target.value)} 
                    className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden text-center font-bold text-lg transition-all" 
                    style={inputStyle} 
                />
            </div>

            {/* Relatives Inputs */}
            <div className="space-y-4">
                {/* Parents */}
                <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الأصول (الآباء والأجداد)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {renderCheckbox('الأب', hasFather, setHasFather, 'يحجب الأجداد والإخوة')}
                        {renderCheckbox('الأم', hasMother, setHasMother, 'تحجب الجدات')}
                        {showPaternalGrandfather && renderCheckbox('الجد لأب', hasPaternalGrandfather, setHasPaternalGrandfather)}
                        {showMaternalGrandmother && renderCheckbox('الجدة لأم', hasMaternalGrandmother, setHasMaternalGrandmother)}
                        {showPaternalGrandmother && renderCheckbox('الجدة لأب', hasPaternalGrandmother, setHasPaternalGrandmother)}
                    </div>
                </div>

                {/* Spouses */}
                <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الزوج والزوجة</h3>
                    <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'none' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'none' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'none'} onChange={() => setSpouseType('none')} className="w-4 h-4 accent-primary" />
                            <span style={{ color: theme.textColor }}>لا يوجد</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'husband' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'husband' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'husband'} onChange={() => setSpouseType('husband')} className="w-4 h-4 accent-primary" />
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: theme.textColor }}>زوج</span>
                                <span className="text-[10px] opacity-70 font-normal leading-tight">يرث النصف أو الربع</span>
                            </div>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'wife' ? (isDefaultTheme ? '#000000' : 'var(--color-primary)') : inputStyle.borderColor, backgroundColor: spouseType === 'wife' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'wife'} onChange={() => setSpouseType('wife')} className="w-4 h-4 accent-primary" />
                            <div className="flex flex-col">
                                <span className="font-bold" style={{ color: theme.textColor }}>زوجة</span>
                                <span className="text-[10px] opacity-70 font-normal leading-tight">ترث الربع أو الثمن</span>
                            </div>
                        </label>
                    </div>
                    {spouseType === 'wife' && (
                        <div className="mt-3 flex items-center gap-3">
                            <label className="text-xs font-bold opacity-80" style={{ color: theme.textColor }}>عدد الزوجات:</label>
                            <input type="number" min="1" max="4" value={wivesCount} onChange={e => setWivesCount(Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))} className="w-16 p-1.5 rounded-lg border text-center font-bold" style={inputStyle} />
                        </div>
                    )}
                </div>

                {/* Descendants */}
                <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الفروع (الأبناء وبناتهم)</h3>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                        {renderNumberInput('الأبناء (ذكور)', sonsCount, setSonsCount)}
                        {renderNumberInput('البنات (إناث)', daughtersCount, setDaughtersCount)}
                    </div>
                    {(showGrandsons || showGranddaughters) && (
                        <div className="grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                            {showGrandsons && renderNumberInput('أبناء الابن', grandsonsCount, setGrandsonsCount, 'يحجبهم وجود الابن المباشر')}
                            {showGranddaughters && renderNumberInput('بنات الابن', granddaughtersCount, setGranddaughtersCount, 'يحجبهم وجود الابن المباشر')}
                        </div>
                    )}
                </div>

                {/* Siblings */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الحواشي (الإخوة والأخوات)</h3>
                        <div className="space-y-3">
                            {showFullSiblings && (
                                <div className="grid grid-cols-2 gap-3">
                                    {renderNumberInput('الإخوة الأشقاء', fullBrothersCount, setFullBrothersCount)}
                                    {renderNumberInput('الأخوات الشقيقات', fullSistersCount, setFullSistersCount)}
                                </div>
                            )}
                            {showPaternalSiblings && (
                                <div className="grid grid-cols-2 gap-3 border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                                    {renderNumberInput('الإخوة لأب', paternalBrothersCount, setPaternalBrothersCount, 'يحجبهم الأخ الشقيق')}
                                    {renderNumberInput('الأخوات لأب', paternalSistersCount, setPaternalSistersCount, 'يحجبهن الأخ الشقيق أو استيفاء الشقيقات للثلثين')}
                                </div>
                            )}
                            {showMaternalSiblings && (
                                <div className="border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                                    {renderNumberInput('الإخوة والأخوات لأم', maternalSiblingsCount, setMaternalSiblingsCount, 'يرثون بالفرض بالسوية بين الذكر والأنثى')}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Extended Heirs */}
                {(showFullNephews || showPaternalNephews || showFullUncles || showPaternalUncles || showFullCousins || showPaternalCousins) && (
                    <div className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>العصبات الأخرى (أبناء الإخوة والأعمام)</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {showFullNephews && renderNumberInput('أبناء الأخ الشقيق (ذكور)', fullNephewsCount, setFullNephewsCount)}
                            {showPaternalNephews && renderNumberInput('أبناء الأخ لأب (ذكور)', paternalNephewsCount, setPaternalNephewsCount)}
                            {showFullUncles && renderNumberInput('الأعمام الأشقاء', fullUnclesCount, setFullUnclesCount)}
                            {showPaternalUncles && renderNumberInput('الأعمام لأب', paternalUnclesCount, setPaternalUnclesCount)}
                            {showFullCousins && renderNumberInput('أبناء العم الشقيق (ذكور)', fullCousinsCount, setFullCousinsCount)}
                            {showPaternalCousins && renderNumberInput('أبناء العم لأب (ذكور)', paternalCousinsCount, setPaternalCousinsCount)}
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {mawarithResults.length > 0 && (
                <div className="themed-card p-5 rounded-2xl shadow-lg animate-fade-in" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                    <h3 className="text-lg font-bold mb-4 flex items-center justify-between" style={{ color: theme.textColor }}>
                        <span>جدول توزيع الميراث</span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-normal">
                            إجمالي الورثة: {mawarithResults.length}
                        </span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="w-full text-right text-sm">
                            <thead>
                                <tr className="border-b opacity-70" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)', color: theme.textColor }}>
                                    <th className="py-2.5 font-bold">الوارث</th>
                                    <th className="py-2.5 font-bold">نوع الإرث</th>
                                    <th className="py-2.5 font-bold">النسبة</th>
                                    <th className="py-2.5 font-bold">المبلغ المستحق</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: theme.isOriginal ? '#f3f4f6' : 'rgba(255,255,255,0.05)' }}>
                                {mawarithResults.map((heir, idx) => (
                                    <tr key={idx} style={{ color: theme.textColor }}>
                                        <td className="py-3 font-bold">{heir.name}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${heir.type === 'فرض' ? 'bg-blue-500/10 text-blue-500' : heir.type === 'تعصيب' ? 'bg-emerald-500/10 text-emerald-500' : heir.type === 'عول' ? 'bg-purple-500/10 text-purple-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {heir.type}
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
