import React, { useState, useMemo } from 'react';
import { calculateMawarith, HeirResult, MawarithInput } from '../../utils/mawarithCalculator';
import { useTheme } from '../../context/ThemeContext';
import { Info, RefreshCw } from 'lucide-react';

const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info size={14} className="text-primary opacity-70 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
    </div>
);

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

    const renderNumberInput = (label: string, value: number, setter: (val: number) => void, tooltip?: string) => (
        <div className="flex flex-col">
            <label className="flex items-center text-xs font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                {label} {tooltip && <Tooltip text={tooltip} />}
            </label>
            <input type="text" inputMode="numeric" pattern="[0-9]*" min="0" value={value || ''} placeholder="0" onChange={e => setter(parseInt(e.target.value) || 0)} className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none text-center transition-all" style={inputStyle} />
        </div>
    );

    const renderCheckbox = (label: string, checked: boolean, setter: (val: boolean) => void, tooltip?: string) => (
        <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-all" style={{ ...inputStyle, borderColor: checked ? 'var(--color-primary)' : inputStyle.borderColor, backgroundColor: checked ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
            <input type="checkbox" checked={checked} onChange={e => setter(e.target.checked)} className="w-4 h-4 accent-primary" />
            <span className="text-sm font-bold flex items-center" style={{ color: theme.textColor }}>
                {label} {tooltip && <Tooltip text={tooltip} />}
            </span>
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
                    <RefreshCw size={14} /> تنظيف
                </button>
            </div>

            {/* Estate Value */}
            <div className="themed-card p-4 rounded-xl border-l-4 border-primary">
                <label className="flex items-center text-sm font-bold mb-2 opacity-80" style={{ color: theme.textColor }}>
                    قيمة التركة الإجمالية <Tooltip text="المبلغ المتبقي بعد تجهيز الميت وسداد ديونه وتنفيذ وصاياه" />
                </label>
                <input type="number" placeholder="أدخل المبلغ" value={estateValue} onChange={e => setEstateValue(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none text-center font-bold text-lg transition-all" style={inputStyle} />
            </div>

            {/* Relatives Inputs */}
            <div className="space-y-4">
                {/* Parents */}
                <div className="themed-card p-4 rounded-xl">
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
                <div className="themed-card p-4 rounded-xl">
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الزوجين</h3>
                    <div className="flex flex-wrap gap-3">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'none' ? 'var(--color-primary)' : inputStyle.borderColor, backgroundColor: spouseType === 'none' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'none'} onChange={() => setSpouseType('none')} className="w-4 h-4 accent-primary" />
                            <span style={{ color: theme.textColor }}>لا يوجد</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'husband' ? 'var(--color-primary)' : inputStyle.borderColor, backgroundColor: spouseType === 'husband' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'husband'} onChange={() => setSpouseType('husband')} className="w-4 h-4 accent-primary" />
                            <span style={{ color: theme.textColor }}>زوج <Tooltip text="يرث النصف إذا لم يكن للمتوفاة فرع وارث، والربع إذا كان لها فرع وارث" /></span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 px-4 rounded-lg border text-sm transition-all" style={{ ...inputStyle, borderColor: spouseType === 'wife' ? 'var(--color-primary)' : inputStyle.borderColor, backgroundColor: spouseType === 'wife' ? 'rgba(16, 185, 129, 0.1)' : inputStyle.backgroundColor }}>
                            <input type="radio" name="spouse" checked={spouseType === 'wife'} onChange={() => setSpouseType('wife')} className="w-4 h-4 accent-primary" />
                            <span style={{ color: theme.textColor }}>زوجة <Tooltip text="ترث الربع إذا لم يكن للمتوفى فرع وارث، والثمن إذا كان له فرع وارث. ويشتركن فيه إذا كن أكثر من واحدة." /></span>
                        </label>
                        {spouseType === 'wife' && (
                            <div className="flex items-center gap-2 ml-auto">
                                <span className="text-sm font-bold" style={{ color: theme.textColor }}>العدد:</span>
                                <input type="number" min="1" max="4" value={wivesCount} onChange={e => setWivesCount(parseInt(e.target.value) || 1)} className="w-16 p-2 rounded-lg border text-center text-sm" style={inputStyle} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Descendants */}
                <div className="themed-card p-4 rounded-xl">
                    <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الفروع (الأبناء والبنات)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {renderNumberInput('عدد الأبناء (ذكور)', sonsCount, setSonsCount, 'الابن يحجب الأحفاد والإخوة والأعمام')}
                        {renderNumberInput('عدد البنات (إناث)', daughtersCount, setDaughtersCount, 'يرثن النصف للواحدة، والثلثين للاثنتين فأكثر، أو بالتعصيب مع الابن')}
                        {showGrandsons && renderNumberInput('أبناء الابن', grandsonsCount, setGrandsonsCount)}
                        {showGranddaughters && renderNumberInput('بنات الابن', granddaughtersCount, setGranddaughtersCount)}
                    </div>
                </div>

                {/* Siblings */}
                {(showFullSiblings || showPaternalSiblings || showMaternalSiblings) && (
                    <div className="themed-card p-4 rounded-xl">
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الإخوة والأخوات</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {showFullSiblings && renderNumberInput('إخوة أشقاء', fullBrothersCount, setFullBrothersCount)}
                            {showFullSiblings && renderNumberInput('أخوات شقيقات', fullSistersCount, setFullSistersCount)}
                            {showPaternalSiblings && renderNumberInput('إخوة لأب', paternalBrothersCount, setPaternalBrothersCount)}
                            {showPaternalSiblings && renderNumberInput('أخوات لأب', paternalSistersCount, setPaternalSistersCount)}
                            {showMaternalSiblings && renderNumberInput('إخوة لأم (ذكور وإناث)', maternalSiblingsCount, setMaternalSiblingsCount, 'يُحجبون بالفرع الوارث والأصل الوارث الذكر')}
                        </div>
                    </div>
                )}

                {/* Uncles & Nephews */}
                {(showFullNephews || showPaternalNephews || showFullUncles || showPaternalUncles || showFullCousins || showPaternalCousins) && (
                    <div className="themed-card p-4 rounded-xl">
                        <h3 className="font-bold mb-3 text-sm opacity-80" style={{ color: theme.textColor }}>الأعمام وأبناء الإخوة</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {showFullNephews && renderNumberInput('أبناء الأخ الشقيق', fullNephewsCount, setFullNephewsCount)}
                            {showPaternalNephews && renderNumberInput('أبناء الأخ لأب', paternalNephewsCount, setPaternalNephewsCount)}
                            {showFullUncles && renderNumberInput('أعمام أشقاء', fullUnclesCount, setFullUnclesCount)}
                            {showPaternalUncles && renderNumberInput('أعمام لأب', paternalUnclesCount, setPaternalUnclesCount)}
                            {showFullCousins && renderNumberInput('أبناء العم الشقيق', fullCousinsCount, setFullCousinsCount)}
                            {showPaternalCousins && renderNumberInput('أبناء العم لأب', paternalCousinsCount, setPaternalCousinsCount)}
                        </div>
                    </div>
                )}
            </div>

            {/* Results */}
            {mawarithResults.length > 0 && (
                <div className="mt-6">
                    <h3 className="text-lg font-bold mb-3" style={{ color: theme.textColor }}>ملخص التوزيع</h3>
                    <div className="rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        <table className="w-full text-right text-sm">
                            <thead className="bg-primary text-white">
                                <tr>
                                    <th className="p-3 font-bold">الوارث</th>
                                    <th className="p-3 font-bold">النسبة</th>
                                    <th className="p-3 font-bold">المبلغ</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800">
                                {mawarithResults.map((result, idx) => (
                                    <tr key={idx} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.05)' }}>
                                        <td className="p-3 font-semibold" style={{ color: theme.textColor }}>
                                            {result.name} <span className="text-[10px] opacity-60 block md:inline md:mr-1">({result.type})</span>
                                        </td>
                                        <td className="p-3 opacity-80" style={{ color: theme.textColor }}>{(result.share * 100).toFixed(2)}%</td>
                                        <td className="p-3 font-bold text-primary">{result.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                <Info className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={16} />
                <p className="text-xs leading-relaxed opacity-90" style={{ color: theme.textColor }}>
                    هذه الحاسبة استرشادية وتدعم الحجب الأساسي. قد لا تشمل بعض المسائل المعقدة (كالمشتركة والأكدرية والعول والرد). يُرجى مراجعة المحاكم الشرعية للاعتماد الرسمي.
                </p>
            </div>
        </div>
    );
};

export default MawarithCalculator;
