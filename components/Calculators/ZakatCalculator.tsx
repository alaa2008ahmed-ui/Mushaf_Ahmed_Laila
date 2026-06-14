import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Info, RefreshCw, Calculator } from 'lucide-react';

const Tooltip = ({ text }: { text: string }) => (
    <div className="group relative inline-block ml-1">
        <Info size={14} className="text-primary opacity-70 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-50 text-center">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
        </div>
    </div>
);

const ZakatCalculator: React.FC = () => {
    const { theme } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000';
    
    // Money
    const [cashAmount, setCashAmount] = useState('');
    
    // Gold & Silver
    const [gold24Weight, setGold24Weight] = useState('');
    const [gold24Price, setGold24Price] = useState('');
    const [gold21Weight, setGold21Weight] = useState('');
    const [gold21Price, setGold21Price] = useState('');
    const [gold18Weight, setGold18Weight] = useState('');
    const [gold18Price, setGold18Price] = useState('');
    const [silverWeight, setSilverWeight] = useState('');
    const [silverPrice, setSilverPrice] = useState('');
    
    // Trade Goods
    const [tradeGoodsValue, setTradeGoodsValue] = useState('');
    
    // Crops
    const [cropsQuantity, setCropsQuantity] = useState('');
    const [irrigationMethod, setIrrigationMethod] = useState<'effort' | 'no_effort'>('no_effort');
    const [cropPricePerKg, setCropPricePerKg] = useState('');

    // Livestock
    const [camelsCount, setCamelsCount] = useState('');
    const [cowsCount, setCowsCount] = useState('');
    const [sheepCount, setSheepCount] = useState('');

    // Rikaz
    const [rikazValue, setRikazValue] = useState('');

    // Real Estate
    const [realEstateIncome, setRealEstateIncome] = useState('');

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
    };

    const clearAll = () => {
        setCashAmount('');
        setGold24Weight(''); setGold24Price('');
        setGold21Weight(''); setGold21Price('');
        setGold18Weight(''); setGold18Price('');
        setSilverWeight(''); setSilverPrice('');
        setTradeGoodsValue('');
        setCropsQuantity(''); setCropPricePerKg('');
        setCamelsCount(''); setCowsCount(''); setSheepCount('');
        setRikazValue('');
        setRealEstateIncome('');
    };

    const formatNumber = (num: number) => {
        return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
    };

    // --- Calculations ---
    
    // 1. Money, Gold, Silver, Trade, Real Estate Income (Subject to Nisab of Gold/Silver)
    const w24 = parseFloat(gold24Weight) || 0;
    const p24 = parseFloat(gold24Price) || 0;
    const w21 = parseFloat(gold21Weight) || 0;
    const p21 = parseFloat(gold21Price) || 0;
    const w18 = parseFloat(gold18Weight) || 0;
    const p18 = parseFloat(gold18Price) || 0;
    const sWeight = parseFloat(silverWeight) || 0;
    const sPrice = parseFloat(silverPrice) || 0;
    const cash = parseFloat(cashAmount) || 0;
    const trade = parseFloat(tradeGoodsValue) || 0;
    const realEstate = parseFloat(realEstateIncome) || 0;

    const goldValue = (w24 * p24) + (w21 * p21) + (w18 * p18);
    const silverValue = sWeight * sPrice;
    const totalMonetaryWealth = goldValue + silverValue + cash + trade + realEstate;

    let price24k = p24;
    if (price24k === 0 && p21 > 0) price24k = p21 * (24 / 21);
    if (price24k === 0 && p18 > 0) price24k = p18 * (24 / 18);
    
    const goldNisabValue = price24k > 0 ? 85 * price24k : 0;
    const silverNisabValue = sPrice > 0 ? 595 * sPrice : 0;
    
    // Use the lower nisab if both exist, otherwise use whichever exists
    let activeNisab = 0;
    if (goldNisabValue > 0 && silverNisabValue > 0) activeNisab = Math.min(goldNisabValue, silverNisabValue);
    else if (goldNisabValue > 0) activeNisab = goldNisabValue;
    else if (silverNisabValue > 0) activeNisab = silverNisabValue;

    let monetaryZakat = 0;
    if (activeNisab > 0 && totalMonetaryWealth >= activeNisab) {
        monetaryZakat = totalMonetaryWealth * 0.025;
    } else if (activeNisab === 0 && totalMonetaryWealth > 0) {
        monetaryZakat = totalMonetaryWealth * 0.025; // If no prices provided, just calculate 2.5%
    }

    // 2. Crops
    const cropsKg = parseFloat(cropsQuantity) || 0;
    const cropPrice = parseFloat(cropPricePerKg) || 0;
    let cropsZakatValue = 0;
    let cropsZakatKg = 0;
    if (cropsKg >= 653) { // 5 Awsuq
        const rate = irrigationMethod === 'no_effort' ? 0.10 : 0.05;
        cropsZakatKg = cropsKg * rate;
        cropsZakatValue = cropsZakatKg * cropPrice;
    }

    // 3. Rikaz
    const rikaz = parseFloat(rikazValue) || 0;
    const rikazZakat = rikaz * 0.20;

    // 4. Livestock (Simplified representation for UI)
    const camels = parseInt(camelsCount) || 0;
    const cows = parseInt(cowsCount) || 0;
    const sheep = parseInt(sheepCount) || 0;
    
    let livestockZakatText = [];
    if (camels >= 5) {
        if (camels <= 9) livestockZakatText.push('شاة واحدة (للإبل)');
        else if (camels <= 14) livestockZakatText.push('شاتان (للإبل)');
        else if (camels <= 19) livestockZakatText.push('3 شياه (للإبل)');
        else if (camels <= 24) livestockZakatText.push('4 شياه (للإبل)');
        else livestockZakatText.push('راجع جدول زكاة الإبل للتفاصيل');
    }
    if (cows >= 30) {
        if (cows <= 39) livestockZakatText.push('تبيع أو تبيعة (للبقر)');
        else if (cows <= 59) livestockZakatText.push('مسنة (للبقر)');
        else livestockZakatText.push('راجع جدول زكاة البقر للتفاصيل');
    }
    if (sheep >= 40) {
        if (sheep <= 120) livestockZakatText.push('شاة واحدة (للغنم)');
        else if (sheep <= 200) livestockZakatText.push('شاتان (للغنم)');
        else if (sheep <= 399) livestockZakatText.push('3 شياه (للغنم)');
        else livestockZakatText.push(`${Math.floor(sheep/100)} شياه (للغنم)`);
    }

    const totalZakatValue = monetaryZakat + cropsZakatValue + rikazZakat;

    const renderInput = (label: string, value: string, setter: (v: string) => void, tooltip: string, placeholder = "0") => (
        <div>
            <label className="flex items-center text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                {label} {tooltip ? <Tooltip text={tooltip} /> : null}
            </label>
            <input type="number" placeholder={placeholder} value={value} onChange={e => setter(e.target.value)} className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition-all" style={inputStyle} />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-coins ${isBlackTheme ? 'text-white' : 'text-primary'}`}></i> تفاصيل الزكاة
                    {totalZakatValue > 0 && (
                        <span className={`text-lg font-bold mr-2 px-4 py-1.5 rounded-full shadow-md whitespace-nowrap ${isBlackTheme ? 'bg-white text-black' : 'bg-emerald-600 text-white'}`}>
                            {formatNumber(totalZakatValue)}
                        </span>
                    )}
                </h2>
                <button onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap">
                    <RefreshCw size={14} /> تنظيف
                </button>
            </div>

            {/* 1. Money & Savings */}
            <div className={`themed-card p-4 rounded-xl border-l-4 ${isBlackTheme ? 'border-white' : 'border-primary'}`}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-wallet ${isBlackTheme ? 'text-white' : 'text-primary'}`}></i> زكاة النقود والمدخرات
                </h3>
                <div>
                    {renderInput('المبلغ النقدي', cashAmount, setCashAmount, 'الأموال النقدية والمدخرات البنكية التي حال عليها الحول')}
                </div>
            </div>

            {/* 2. Gold & Silver */}
            <div className="themed-card p-4 rounded-xl border-l-4 border-yellow-500">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-ring text-yellow-500"></i> زكاة الذهب والفضة
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="font-bold text-sm" style={{ color: theme.textColor }}>عيار 24 <Tooltip text="الذهب الخالص (نصابه 85 جرام)" /></div>
                        {renderInput('الوزن (جرام)', gold24Weight, setGold24Weight, '', 'الوزن')}
                        {renderInput('سعر الجرام', gold24Price, setGold24Price, '', 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="font-bold text-sm" style={{ color: theme.textColor }}>عيار 21 <Tooltip text="نصابه 97.14 جرام تقريباً" /></div>
                        {renderInput('الوزن (جرام)', gold21Weight, setGold21Weight, '', 'الوزن')}
                        {renderInput('سعر الجرام', gold21Price, setGold21Price, '', 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="font-bold text-sm" style={{ color: theme.textColor }}>عيار 18 <Tooltip text="نصابه 113.33 جرام تقريباً" /></div>
                        {renderInput('الوزن (جرام)', gold18Weight, setGold18Weight, '', 'الوزن')}
                        {renderInput('سعر الجرام', gold18Price, setGold18Price, '', 'السعر')}
                    </div>
                    <div className="border-t pt-3 mt-3 grid grid-cols-3 gap-2 items-end" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        <div className="font-bold text-sm" style={{ color: theme.textColor }}>الفضة <Tooltip text="نصاب الفضة 595 جرام" /></div>
                        {renderInput('الوزن (جرام)', silverWeight, setSilverWeight, '', 'الوزن')}
                        {renderInput('سعر الجرام', silverPrice, setSilverPrice, '', 'السعر')}
                    </div>
                </div>
            </div>

            {/* 3. Trade Goods & Real Estate */}
            <div className="themed-card p-4 rounded-xl border-l-4 border-blue-500">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-shop text-blue-500"></i> عروض التجارة والعقارات
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('قيمة عروض التجارة', tradeGoodsValue, setTradeGoodsValue, 'قيمة البضائع المعدة للبيع بسعر السوق الحالي')}
                    {renderInput('غلة العقارات الاستثمارية', realEstateIncome, setRealEstateIncome, 'الإيجار العائد من العقارات بعد مرور الحول عليه')}
                </div>
            </div>

            {/* 4. Crops */}
            <div className={`themed-card p-4 rounded-xl border-l-4 ${isBlackTheme ? 'border-white' : 'border-green-500'}`}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-wheat-awn ${isBlackTheme ? 'text-white' : 'text-green-500'}`}></i> زكاة الزروع والثمار
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput('الكمية (كجم)', cropsQuantity, setCropsQuantity, 'نصاب الزروع 5 أوسق (حوالي 653 كجم)')}
                    <div>
                        <label className="flex items-center text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                            طريقة الري <Tooltip text="سقي بماء المطر (العشر 10%)، سقي بآلة وتكلفة (نصف العشر 5%)" />
                        </label>
                        <select value={irrigationMethod} onChange={e => setIrrigationMethod(e.target.value as any)} className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-all ${isBlackTheme ? 'focus:ring-white' : 'focus:ring-primary'}`} style={inputStyle}>
                            <option value="no_effort">بدون تكلفة (أمطار/عيون) - 10%</option>
                            <option value="effort">بتكلفة (آلات/مضخات) - 5%</option>
                        </select>
                    </div>
                    {renderInput(`سعر الكيلو`, cropPricePerKg, setCropPricePerKg, 'اختياري: لحساب القيمة النقدية للزكاة')}
                </div>
                {cropsZakatKg > 0 && (
                    <div className={`mt-3 text-sm font-bold ${isBlackTheme ? 'text-white' : 'text-green-600 dark:text-green-400'}`}>
                        المقدار الواجب إخراجه: {cropsZakatKg.toFixed(2)} كجم
                    </div>
                )}
            </div>

            {/* 5. Livestock & Rikaz */}
            <div className="themed-card p-4 rounded-xl border-l-4 border-orange-500">
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-cow text-orange-500"></i> الأنعام والركاز
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {renderInput('الإبل', camelsCount, setCamelsCount, 'النصاب يبدأ من 5')}
                    {renderInput('البقر', cowsCount, setCowsCount, 'النصاب يبدأ من 30')}
                    {renderInput('الغنم', sheepCount, setSheepCount, 'النصاب يبدأ من 40')}
                </div>
                {livestockZakatText.length > 0 && (
                    <div className="mb-4 p-2 bg-orange-500/10 rounded-lg text-sm font-bold text-orange-600 dark:text-orange-400">
                        زكاة الأنعام: {livestockZakatText.join(' ، ')}
                    </div>
                )}
                <div className="border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                    {renderInput('قيمة الركاز والمعادن', rikazValue, setRikazValue, 'ما يستخرج من الأرض من دفائن (الواجب فيه الخُمس 20%)')}
                </div>
            </div>

            {/* Final Summary */}
            <div className={`mt-8 p-6 rounded-2xl border text-center shadow-lg relative overflow-hidden ${isBlackTheme ? 'bg-white/10 border-white/30' : 'bg-gradient-to-br from-primary/20 to-primary/5 border-primary/30'}`}>
                <div className={`absolute top-0 left-0 w-full h-1 ${isBlackTheme ? 'bg-white' : 'bg-gradient-to-r from-primary to-blue-500'}`}></div>
                <h3 className="text-lg font-bold opacity-90 mb-2" style={{ color: theme.textColor }}>الملخص النهائي للزكاة النقدية</h3>
                
                <div className="flex justify-center items-baseline gap-2 mb-4">
                    <span className={`text-5xl font-black drop-shadow-md ${isBlackTheme ? 'text-white' : 'text-emerald-600'}`}>
                        {totalZakatValue > 0 ? formatNumber(totalZakatValue) : '0'}
                    </span>
                </div>

                {totalZakatValue > 0 && (
                    <div className="text-sm space-y-1 opacity-80 text-right max-w-xs mx-auto" style={{ color: theme.textColor }}>
                        {monetaryZakat > 0 && <div className="flex justify-between"><span>المال والذهب والتجارة:</span> <span>{formatNumber(monetaryZakat)}</span></div>}
                        {cropsZakatValue > 0 && <div className="flex justify-between"><span>الزروع والثمار:</span> <span>{formatNumber(cropsZakatValue)}</span></div>}
                        {rikazZakat > 0 && <div className="flex justify-between"><span>الركاز والمعادن:</span> <span>{formatNumber(rikazZakat)}</span></div>}
                    </div>
                )}
                
                {totalMonetaryWealth > 0 && activeNisab > 0 && totalMonetaryWealth < activeNisab && (
                    <p className="text-sm text-red-500 mt-3 font-bold">
                        لم يبلغ المال النصاب (النصاب الحالي: {formatNumber(activeNisab)})
                    </p>
                )}
            </div>
        </div>
    );
};

export default ZakatCalculator;
