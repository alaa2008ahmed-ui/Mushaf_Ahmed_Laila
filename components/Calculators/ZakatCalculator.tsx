import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';

const ZakatCalculator: React.FC<{ cardBorderColor?: string }> = ({ cardBorderColor: propCardBorderColor }) => {
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

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: cardBorderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
        color: theme.textColor,
        textAlign: isEn ? 'left' : 'right',
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
        monetaryZakat = totalMonetaryWealth * 0.025; // If no prices provided, calculate 2.5%
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
    
    let livestockZakatText: string[] = [];
    if (camels >= 5) {
        if (camels <= 9) livestockZakatText.push(isEn ? '1 sheep (for camels)' : 'شاة واحدة (للإبل)');
        else if (camels <= 14) livestockZakatText.push(isEn ? '2 sheep (for camels)' : 'شاتان (للإبل)');
        else if (camels <= 19) livestockZakatText.push(isEn ? '3 sheep (for camels)' : '3 شياه (للإبل)');
        else if (camels <= 24) livestockZakatText.push(isEn ? '4 sheep (for camels)' : '4 شياه (للإبل)');
        else livestockZakatText.push(isEn ? 'Refer to Camel Zakat table for details' : 'راجع جدول زكاة الإبل للتفاصيل');
    }
    if (cows >= 30) {
        if (cows <= 39) livestockZakatText.push(isEn ? '1 one-year-old calf (for cows)' : 'تبيع أو تبيعة (للبقر)');
        else if (cows <= 59) livestockZakatText.push(isEn ? '1 two-year-old cow (for cows)' : 'مسنة (للبقر)');
        else livestockZakatText.push(isEn ? 'Refer to Cattle Zakat table for details' : 'راجع جدول زكاة البقر للتفاصيل');
    }
    if (sheep >= 40) {
        if (sheep <= 120) livestockZakatText.push(isEn ? '1 sheep (for sheep/goats)' : 'شاة واحدة (للغنم)');
        else if (sheep <= 200) livestockZakatText.push(isEn ? '2 sheep (for sheep/goats)' : 'شاتان (للغنم)');
        else if (sheep <= 399) livestockZakatText.push(isEn ? '3 sheep (for sheep/goats)' : '3 شياه (للغنم)');
        else livestockZakatText.push(isEn ? `${Math.floor(sheep/100)} sheep (for sheep/goats)` : `${Math.floor(sheep/100)} شياه (للغنم)`);
    }

    const totalZakatValue = monetaryZakat + cropsZakatValue + rikazZakat;

    const renderInput = (label: string, value: string, setter: (v: string) => void, hint = "", placeholder = "0") => (
        <div className="flex flex-col">
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                <span className="text-sm font-bold opacity-90" style={{ color: theme.textColor }}>
                    {label}
                </span>
                {hint && (
                    <span className="text-[11px] opacity-75 font-normal leading-tight">
                        {hint}
                    </span>
                )}
            </div>
            <input 
                type="number" 
                placeholder={placeholder} 
                value={value} 
                onChange={e => setter(e.target.value)} 
                className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-sm font-bold" 
                style={inputStyle} 
            />
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="zakat-header-actions" className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-coins ${isBlackTheme ? 'text-white' : 'text-primary'}`}></i> 
                    <span>{isEn ? 'Zakat Calculation Details' : 'تفاصيل الزكاة'}</span>
                    {totalZakatValue > 0 && (
                        <span className={`text-lg font-bold ${isEn ? 'ml-2' : 'mr-2'} px-4 py-1.5 rounded-full shadow-md whitespace-nowrap ${isBlackTheme ? 'bg-white text-black' : 'bg-emerald-600 text-white'}`}>
                            {formatNumber(totalZakatValue)}
                        </span>
                    )}
                </h2>
                <button id="btn-zakat-reset" onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer">
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* 1. Money & Savings */}
            <div id="zakat-card-cash" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-wallet ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}></i> 
                    <span>{isEn ? 'Cash & Savings Zakat' : 'زكاة النقود والمدخرات'}</span>
                </h3>
                <div>
                    {renderInput(
                        isEn ? 'Cash Amount' : 'المبلغ النقدي', 
                        cashAmount, 
                        setCashAmount, 
                        isEn ? 'Cash and bank savings held for a full lunar year (Hawl)' : 'الأموال النقدية والمدخرات البنكية التي حال عليها الحول'
                    )}
                </div>
            </div>

            {/* 2. Gold & Silver */}
            <div id="zakat-card-gold-silver" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-ring text-yellow-500"></i> 
                    <span>{isEn ? 'Gold & Silver Zakat' : 'زكاة الذهب والفضة'}</span>
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                {isEn ? '24K Gold' : 'عيار 24'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight">
                                {isEn ? 'Nisab: 85g' : 'نصابه 85 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold24Weight, setGold24Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold24Price, setGold24Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                {isEn ? '21K Gold' : 'عيار 21'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight">
                                {isEn ? 'Nisab: 97.14g' : 'نصابه 97.14 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold21Weight, setGold21Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold21Price, setGold21Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                {isEn ? '18K Gold' : 'عيار 18'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight">
                                {isEn ? 'Nisab: 113.33g' : 'نصابه 113.33 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold18Weight, setGold18Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold18Price, setGold18Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="border-t pt-3 mt-3 grid grid-cols-3 gap-2 items-end" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: theme.textColor }}>
                                {isEn ? 'Silver' : 'الفضة'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight">
                                {isEn ? 'Nisab: 595g' : 'نصابها 595 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', silverWeight, setSilverWeight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', silverPrice, setSilverPrice, '', isEn ? 'Price' : 'السعر')}
                    </div>
                </div>
            </div>

            {/* 3. Trade Goods & Real Estate */}
            <div id="zakat-card-trade" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-shop text-blue-500"></i> 
                    <span>{isEn ? 'Trade Merchandise & Real Estate' : 'عروض التجارة والعقارات'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput(
                        isEn ? 'Trade Merchandise Value' : 'قيمة عروض التجارة', 
                        tradeGoodsValue, 
                        setTradeGoodsValue, 
                        isEn ? 'Goods intended for sale at current market value' : 'البضائع المعدة للبيع بسعر السوق الحالي'
                    )}
                    {renderInput(
                        isEn ? 'Investment Real Estate Income' : 'غلة العقارات الاستثمارية', 
                        realEstateIncome, 
                        setRealEstateIncome, 
                        isEn ? 'Rental income held for a full lunar year' : 'إيجار العقارات بعد مرور الحول عليه'
                    )}
                </div>
            </div>

            {/* 4. Crops */}
            <div id="zakat-card-crops" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-wheat-awn ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-green-500')}`}></i> 
                    <span>{isEn ? 'Crops & Agricultural Produce' : 'زكاة الزروع والثمار'}</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInput(
                        isEn ? 'Quantity (kg)' : 'الكمية (كجم)', 
                        cropsQuantity, 
                        setCropsQuantity, 
                        isEn ? 'Nisab: 5 Awsuq (approx. 653 kg)' : 'النصاب 5 أوسق (653 كجم)'
                    )}
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span className="text-sm font-bold opacity-90" style={{ color: theme.textColor }}>
                                {isEn ? 'Irrigation Method' : 'طريقة الري'}
                            </span>
                            <span className="text-[11px] opacity-75 font-normal leading-tight">
                                {isEn ? 'Rainfed 10% / Irrigated 5%' : 'أمطار 10% / آلات 5%'}
                            </span>
                        </div>
                        <select 
                            value={irrigationMethod} 
                            onChange={e => setIrrigationMethod(e.target.value as any)} 
                            className={`w-full p-2.5 rounded-lg border focus:ring-2 focus:outline-hidden transition-all text-sm ${isBlackTheme ? 'focus:ring-white' : 'focus:ring-primary'}`} 
                            style={inputStyle}
                        >
                            <option value="no_effort">
                                {isEn ? 'Naturally Irrigated (Rain / Springs) - 10%' : 'بدون تكلفة (أمطار/عيون) - 10%'}
                            </option>
                            <option value="effort">
                                {isEn ? 'Artificially Irrigated (Pumps / Machinery) - 5%' : 'بتكلفة (آلات/مضخات) - 5%'}
                            </option>
                        </select>
                    </div>
                    {renderInput(
                        isEn ? 'Price per kg' : 'سعر الكيلو', 
                        cropPricePerKg, 
                        setCropPricePerKg, 
                        isEn ? 'Optional: to calculate monetary equivalent' : 'اختياري: لحساب القيمة النقدية'
                    )}
                </div>
                {cropsZakatKg > 0 && (
                    <div className={`mt-3 text-sm font-bold ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-green-600 dark:text-green-400')}`}>
                        {isEn 
                            ? `Required Amount to pay: ${cropsZakatKg.toFixed(2)} kg` 
                            : `المقدار الواجب إخراجه: ${cropsZakatKg.toFixed(2)} كجم`}
                    </div>
                )}
            </div>

            {/* 5. Livestock & Rikaz */}
            <div id="zakat-card-livestock" className="themed-card p-4 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-cow text-orange-500"></i> 
                    <span>{isEn ? 'Livestock & Rikaz (Treasure)' : 'الأنعام والركاز'}</span>
                </h3>
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {renderInput(isEn ? 'Camels' : 'الإبل', camelsCount, setCamelsCount, isEn ? 'Nisab from 5' : 'النصاب من 5')}
                    {renderInput(isEn ? 'Cattle / Cows' : 'البقر', cowsCount, setCowsCount, isEn ? 'Nisab from 30' : 'النصاب من 30')}
                    {renderInput(isEn ? 'Sheep & Goats' : 'الغنم', sheepCount, setSheepCount, isEn ? 'Nisab from 40' : 'النصاب من 40')}
                </div>
                {livestockZakatText.length > 0 && (
                    <div className="mb-4 p-2 bg-orange-500/10 rounded-lg text-sm font-bold text-orange-600 dark:text-orange-400">
                        {isEn ? 'Livestock Zakat: ' : 'زكاة الأنعام: '}
                        {livestockZakatText.join(isEn ? ', ' : ' ، ')}
                    </div>
                )}
                <div className="border-t pt-3" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                    {renderInput(
                        isEn ? 'Rikaz & Minerals Value' : 'قيمة الركاز والمعادن', 
                        rikazValue, 
                        setRikazValue, 
                        isEn ? 'Buried treasure / extracted minerals (Due is 1/5: 20%)' : 'دفائن الأرض (الواجب فيه الخُمس 20%)'
                    )}
                </div>
            </div>

            {/* Final Summary */}
            <div id="zakat-card-summary" className={`mt-8 p-6 rounded-2xl border text-center shadow-lg relative overflow-hidden ${isBlackTheme ? 'bg-white/10' : 'bg-gradient-to-br from-primary/20 to-primary/5'}`} style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <div className={`absolute top-0 left-0 w-full h-1 ${isBlackTheme ? 'bg-white' : (isDefaultTheme ? 'bg-black' : 'bg-gradient-to-r from-primary to-blue-500')}`}></div>
                <h3 className="text-lg font-bold opacity-90 mb-2" style={{ color: theme.textColor }}>
                    {isEn ? 'Final Cash Zakat Summary' : 'الملخص النهائي للزكاة النقدية'}
                </h3>
                
                <div className="flex justify-center items-baseline gap-2 mb-4">
                    <span className={`text-5xl font-black drop-shadow-md ${isBlackTheme ? 'text-white' : 'text-emerald-600'}`}>
                        {totalZakatValue > 0 ? formatNumber(totalZakatValue) : '0'}
                    </span>
                </div>

                {totalZakatValue > 0 && (
                    <div className={`text-sm space-y-1 opacity-80 ${isEn ? 'text-left' : 'text-right'} max-w-xs mx-auto`} style={{ color: theme.textColor }}>
                        {monetaryZakat > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Cash, Gold & Trade:' : 'المال والذهب والتجارة:'}</span> 
                                <span>{formatNumber(monetaryZakat)}</span>
                            </div>
                        )}
                        {cropsZakatValue > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Crops & Produce:' : 'الزروع والثمار:'}</span> 
                                <span>{formatNumber(cropsZakatValue)}</span>
                            </div>
                        )}
                        {rikazZakat > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Rikaz & Minerals:' : 'الركاز والمعادن:'}</span> 
                                <span>{formatNumber(rikazZakat)}</span>
                            </div>
                        )}
                    </div>
                )}
                
                {totalMonetaryWealth > 0 && activeNisab > 0 && totalMonetaryWealth < activeNisab && (
                    <p className="text-sm text-red-500 mt-3 font-bold">
                        {isEn 
                            ? `Wealth has not reached Nisab threshold (Current Nisab: ${formatNumber(activeNisab)})` 
                            : `لم يبلغ المال النصاب (النصاب الحالي: ${formatNumber(activeNisab)})`}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ZakatCalculator;
