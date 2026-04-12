import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';

const MawarithCalculator: React.FC = () => {
    const { theme } = useTheme();
    
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

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
        fontFamily: 'Cairo, sans-serif'
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

    const mawarithInput: MawarithInput = {
        estateValue, spouseType, wivesCount, hasFather, hasMother, sonsCount, daughtersCount,
        grandsonsCount: showGrandsons ? grandsonsCount : 0,
        granddaughtersCount: showGranddaughters ? granddaughtersCount : 0,
        hasPaternalGrandfather: showPaternalGrandfather ? hasPaternalGrandfather : false,
        hasMaternalGrandmother: showMaternalGrandmother ? hasMaternalGrandmother : false,
        hasPaternalGrandmother: showPaternalGrandmother ? hasPaternalGrandmother : false,
        fullBrothersCount: showFullSiblings ? fullBrothersCount : 0,
        fullSistersCount: showFullSiblings ? fullSistersCount : 0,
        paternalBrothersCount: showPaternalSiblings ? paternalBrothersCount : 0,
        paternalSistersCount: showPaternalSiblings ? paternalSistersCount : 0,
        maternalSiblingsCount: showMaternalSiblings ? maternalSiblingsCount : 0,
        fullNephewsCount: showFullNephews ? fullNephewsCount : 0,
        paternalNephewsCount: showPaternalNephews ? paternalNephewsCount : 0,
        fullUnclesCount: showFullUncles ? fullUnclesCount : 0,
        paternalUnclesCount: showPaternalUncles ? paternalUnclesCount : 0,
        fullCousinsCount: showFullCousins ? fullCousinsCount : 0,
        paternalCousinsCount: showPaternalCousins ? paternalCousinsCount : 0,
    };

    const mawarithResults: HeirResult[] = useMemo(() => calculateMawarith(mawarithInput), [mawarithInput]);

    const renderNumberInput = (label: string, value: number, setter: (val: number) => void) => (
        <div className="flex flex-col">
            <label className="text-xs font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>{label}</label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={value || ''} placeholder="0" onChange={e => setter(parseInt(e.target.value) || 0)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none text-center" style={inputStyle} />
        </div>
    );

    const renderCheckbox = (label: string, checked: boolean, setter: (val: boolean) => void) => (
        <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border" style={{ ...inputStyle, borderColor: checked ? 'var(--color-primary)' : inputStyle.borderColor, backgroundColor: checked ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
            <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold" style={{ color: theme.textColor }}>{label}</span>
        </label>
    );

    return (
        <div className="themed-card p-4 rounded-xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-scale-balanced text-primary"></i> توزيع الميراث
                </h2>
            </div>

            <div>
                <input type="number" placeholder="قيمة التركة الإجمالية" value={estateValue} onChange={e => setEstateValue(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none text-center font-bold" style={inputStyle} />
            </div>

            <div className="space-y-3">
                {/* الأصول (الآباء والأمهات والأجداد) */}
                <div className="grid grid-cols-2 gap-2">
                    {renderCheckbox('الأب', hasFather, setHasFather)}
                    {renderCheckbox('الأم', hasMother, setHasMother)}
                    {showPaternalGrandfather && renderCheckbox('الجد لأب', hasPaternalGrandfather, setHasPaternalGrandfather)}
                    {showMaternalGrandmother && renderCheckbox('الجدة لأم', hasMaternalGrandmother, setHasMaternalGrandmother)}
                    {showPaternalGrandmother && renderCheckbox('الجدة لأب', hasPaternalGrandmother, setHasPaternalGrandmother)}
                </div>

                {/* الزوجين */}
                <div className="flex flex-wrap gap-2">
                    <label className="flex items-center gap-1 cursor-pointer p-1.5 px-3 rounded-lg border text-sm" style={{ ...inputStyle, borderColor: spouseType === 'none' ? 'var(--color-primary)' : inputStyle.borderColor }}>
                        <input type="radio" name="spouse" checked={spouseType === 'none'} onChange={() => setSpouseType('none')} className="w-4 h-4 accent-primary" />
                        <span style={{ color: theme.textColor }}>لا يوجد زوج/ة</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer p-1.5 px-3 rounded-lg border text-sm" style={{ ...inputStyle, borderColor: spouseType === 'husband' ? 'var(--color-primary)' : inputStyle.borderColor }}>
                        <input type="radio" name="spouse" checked={spouseType === 'husband'} onChange={() => setSpouseType('husband')} className="w-4 h-4 accent-primary" />
                        <span style={{ color: theme.textColor }}>زوج</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer p-1.5 px-3 rounded-lg border text-sm" style={{ ...inputStyle, borderColor: spouseType === 'wife' ? 'var(--color-primary)' : inputStyle.borderColor }}>
                        <input type="radio" name="spouse" checked={spouseType === 'wife'} onChange={() => setSpouseType('wife')} className="w-4 h-4 accent-primary" />
                        <span style={{ color: theme.textColor }}>زوجة</span>
                    </label>
                    {spouseType === 'wife' && (
                        <input type="number" min="1" max="4" value={wivesCount} onChange={e => setWivesCount(parseInt(e.target.value) || 1)} className="w-16 p-1 rounded-lg border text-center text-sm" style={inputStyle} />
                    )}
                </div>

                {/* الفروع (الأبناء والبنات وأبناؤهم) */}
                <div className="grid grid-cols-2 gap-2">
                    {renderNumberInput('عدد الأبناء (ذكور)', sonsCount, setSonsCount)}
                    {renderNumberInput('عدد البنات (إناث)', daughtersCount, setDaughtersCount)}
                    {showGrandsons && renderNumberInput('أبناء الابن', grandsonsCount, setGrandsonsCount)}
                    {showGranddaughters && renderNumberInput('بنات الابن', granddaughtersCount, setGranddaughtersCount)}
                </div>

                {/* الإخوة والأخوات */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div className="grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        {showFullSiblings && renderNumberInput('إخوة أشقاء', fullBrothersCount, setFullBrothersCount)}
                        {showFullSiblings && renderNumberInput('أخوات شقيقات', fullSistersCount, setFullSistersCount)}
                        {showPaternalSiblings && renderNumberInput('إخوة لأب', paternalBrothersCount, setPaternalBrothersCount)}
                        {showPaternalSiblings && renderNumberInput('أخوات لأب', paternalSistersCount, setPaternalSistersCount)}
                        {showMaternalSiblings && renderNumberInput('إخوة لأم (ذكور وإناث)', maternalSiblingsCount, setMaternalSiblingsCount)}
                    </div>
                )}

                {/* أبناء الإخوة والأعمام وأبناؤهم */}
                {(showFullNephews || showPaternalNephews || showFullUncles || showPaternalUncles || showFullCousins || showPaternalCousins) && (
                    <div className="grid grid-cols-2 gap-2 border-t pt-2" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        {showFullNephews && renderNumberInput('أبناء الأخ الشقيق', fullNephewsCount, setFullNephewsCount)}
                        {showPaternalNephews && renderNumberInput('أبناء الأخ لأب', paternalNephewsCount, setPaternalNephewsCount)}
                        {showFullUncles && renderNumberInput('أعمام أشقاء', fullUnclesCount, setFullUnclesCount)}
                        {showPaternalUncles && renderNumberInput('أعمام لأب', paternalUnclesCount, setPaternalUnclesCount)}
                        {showFullCousins && renderNumberInput('أبناء العم الشقيق', fullCousinsCount, setFullCousinsCount)}
                        {showPaternalCousins && renderNumberInput('أبناء العم لأب', paternalCousinsCount, setPaternalCousinsCount)}
                    </div>
                )}
            </div>

            {mawarithResults.length > 0 && (
                <div className="mt-4">
                    <div className="rounded-lg overflow-hidden border" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        <table className="w-full text-right text-sm">
                            <thead className="bg-primary/10">
                                <tr>
                                    <th className="p-2 font-bold" style={{ color: theme.textColor }}>الوارث</th>
                                    <th className="p-2 font-bold" style={{ color: theme.textColor }}>النسبة</th>
                                    <th className="p-2 font-bold" style={{ color: theme.textColor }}>المبلغ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {mawarithResults.map((result, idx) => (
                                    <tr key={idx} className="border-t" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.05)' }}>
                                        <td className="p-2 font-semibold" style={{ color: theme.textColor }}>
                                            {result.name} <span className="text-[10px] opacity-60">({result.type})</span>
                                        </td>
                                        <td className="p-2 opacity-80" style={{ color: theme.textColor }}>{(result.share * 100).toFixed(1)}%</td>
                                        <td className="p-2 font-bold text-primary">{result.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-4 p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <p className="text-[10px] leading-relaxed text-center opacity-80" style={{ color: theme.textColor }}>
                    ⚠️ هذه الحاسبة استرشادية وتدعم الحجب الأساسي. قد لا تشمل بعض المسائل المعقدة (كالمشتركة والأكدرية). يُرجى مراجعة المحاكم الشرعية للاعتماد الرسمي.
                </p>
            </div>
        </div>
    );
};

export default MawarithCalculator;
