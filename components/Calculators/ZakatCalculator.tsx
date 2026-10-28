import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { RefreshCw } from 'lucide-react';
import { getModernFlatTokens, hexToRgba } from '../../utils/flatDesignTokens';

const ZakatCalculator: React.FC = () => {
    const { theme, themeKey } = useTheme();
    const tokens = getModernFlatTokens(theme, themeKey);
    const { language } = useLanguage();
    const isEn = language === 'en';
    
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
    
    let activeNisab = 0;
    if (goldNisabValue > 0 && silverNisabValue > 0) {
        activeNisab = Math.min(goldNisabValue, silverNisabValue);
    } else {
        activeNisab = goldNisabValue || silverNisabValue;
    }

    let monetaryZakat = 0;
    if (activeNisab > 0 && totalMonetaryWealth >= activeNisab) {
        monetaryZakat = totalMonetaryWealth * 0.025;
    } else if (activeNisab === 0 && totalMonetaryWealth > 0) {
        monetaryZakat = totalMonetaryWealth * 0.025;
    }

    // Crops
    const cropsQty = parseFloat(cropsQuantity) || 0;
    const cropPrice = parseFloat(cropPricePerKg) || 0;
    let cropsZakatKg = 0;
    let cropsZakatValue = 0;

    if (cropsQty >= 653) {
        const rate = irrigationMethod === 'no_effort' ? 0.10 : 0.05;
        cropsZakatKg = cropsQty * rate;
        if (cropPrice > 0) {
            cropsZakatValue = cropsZakatKg * cropPrice;
        }
    }

    // Rikaz
    const rikaz = parseFloat(rikazValue) || 0;
    const rikazZakat = rikaz > 0 ? rikaz * 0.20 : 0;

    // Livestock
    const camels = parseInt(camelsCount, 10) || 0;
    const cows = parseInt(cowsCount, 10) || 0;
    const sheep = parseInt(sheepCount, 10) || 0;
    const livestockZakatText: string[] = [];

    if (camels >= 5) {
        if (camels <= 9) livestockZakatText.push(isEn ? '1 sheep (for camels)' : 'شاة واحدة (للإبل)');
        else if (camels <= 14) livestockZakatText.push(isEn ? '2 sheep (for camels)' : 'شاتان (للإبل)');
        else if (camels <= 19) livestockZakatText.push(isEn ? '3 sheep (for camels)' : '3 شياه (للإبل)');
        else if (camels <= 24) livestockZakatText.push(isEn ? '4 sheep (for camels)' : '4 شياه (للإبل)');
        else if (camels <= 35) livestockZakatText.push(isEn ? '1 Bint Makhad (1-year female camel)' : 'بنت مخاض (أنثى إبل أكملت سنة)');
        else livestockZakatText.push(isEn ? 'Due according to camel table' : 'يجب ما فوق ذلك بحسب جدول الإبل الشرعي');
    }

    if (cows >= 30) {
        if (cows <= 39) livestockZakatText.push(isEn ? '1 Tabi (1-year bull or heifer)' : 'تبيع أو تبيعة (أكمل سنة)');
        else if (cows <= 59) livestockZakatText.push(isEn ? '1 Musinnah (2-year cow)' : 'مسنة (بقرة أكملت سنتين)');
        else livestockZakatText.push(isEn ? 'Due according to cattle table' : 'يجب ما فوق ذلك بحسب جدول البقر الشرعي');
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
            <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                <span className="text-sm font-bold" style={{ color: tokens.textColor }}>
                    {label}
                </span>
                {hint && (
                    <span className="text-[11px] font-normal leading-tight opacity-75" style={{ color: tokens.subtextColor }}>
                        {hint}
                    </span>
                )}
            </div>
            <input 
                type="number" 
                placeholder={placeholder} 
                value={value} 
                onChange={e => setter(e.target.value)} 
                className={`w-full p-3 rounded-xl border-0 focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold bg-slate-100 dark:bg-zinc-800 ${isEn ? 'text-left' : 'text-right'}`}
                style={{ color: tokens.textColor }}
            />
        </div>
    );

    return (
        <div className="space-y-4 animate-fade-in pb-8" dir={isEn ? 'ltr' : 'rtl'}>
            {/* Header Actions */}
            <div id="zakat-header-actions" className="flex justify-between items-center mb-2">
                <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-coins" style={{ color: tokens.primaryColor }}></i> 
                    <span>{isEn ? 'Zakat Calculation Details' : 'تفاصيل الزكاة'}</span>
                    {totalZakatValue > 0 && (
                        <span className={`text-base font-bold ${isEn ? 'ml-2' : 'mr-2'} px-3.5 py-1 rounded-full shadow-sm text-white`} style={{ backgroundColor: tokens.primaryColor }}>
                            {formatNumber(totalZakatValue)}
                        </span>
                    )}
                </h2>
                <button id="btn-zakat-reset" onClick={clearAll} className="flex items-center gap-1.5 text-xs sm:text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer border-0">
                    <RefreshCw size={14} /> 
                    <span>{isEn ? 'Reset' : 'إعادة ضبط'}</span>
                </button>
            </div>

            {/* 1. Money & Savings */}
            <div 
                id="zakat-card-cash" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-wallet" style={{ color: tokens.primaryColor }}></i> 
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
            <div 
                id="zakat-card-gold-silver" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-ring text-amber-500"></i> 
                    <span>{isEn ? 'Gold & Silver Zakat' : 'زكاة الذهب والفضة'}</span>
                </h3>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2.5 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                                {isEn ? '24K Gold' : 'عيار 24'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Nisab: 85g' : 'نصابه 85 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold24Weight, setGold24Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold24Price, setGold24Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                                {isEn ? '21K Gold' : 'عيار 21'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Nisab: 97.14g' : 'نصابه 97.14 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold21Weight, setGold21Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold21Price, setGold21Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="grid grid-cols-3 gap-2.5 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                                {isEn ? '18K Gold' : 'عيار 18'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Nisab: 113.33g' : 'نصابه 113.33 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', gold18Weight, setGold18Weight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', gold18Price, setGold18Price, '', isEn ? 'Price' : 'السعر')}
                    </div>
                    <div className="border-t border-slate-100 dark:border-zinc-800 pt-3.5 mt-2 grid grid-cols-3 gap-2.5 items-end">
                        <div className="flex flex-col justify-end">
                            <span className="font-bold text-sm" style={{ color: tokens.textColor }}>
                                {isEn ? 'Silver' : 'الفضة'}
                            </span>
                            <span className="text-[10px] opacity-75 leading-tight" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Nisab: 595g' : 'نصابها 595 جرام'}
                            </span>
                        </div>
                        {renderInput(isEn ? 'Weight (g)' : 'الوزن (جرام)', silverWeight, setSilverWeight, '', isEn ? 'Weight' : 'الوزن')}
                        {renderInput(isEn ? 'Price / g' : 'سعر الجرام', silverPrice, setSilverPrice, '', isEn ? 'Price' : 'السعر')}
                    </div>
                </div>
            </div>

            {/* 3. Trade Goods & Real Estate */}
            <div 
                id="zakat-card-trade" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
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
            <div 
                id="zakat-card-crops" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-wheat-awn text-emerald-500"></i> 
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
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1.5">
                            <span className="text-sm font-bold" style={{ color: tokens.textColor }}>
                                {isEn ? 'Irrigation Method' : 'طريقة الري'}
                            </span>
                            <span className="text-[11px] font-normal leading-tight opacity-75" style={{ color: tokens.subtextColor }}>
                                {isEn ? 'Rainfed 10% / Irrigated 5%' : 'أمطار 10% / آلات 5%'}
                            </span>
                        </div>
                        <select 
                            value={irrigationMethod} 
                            onChange={e => setIrrigationMethod(e.target.value as any)} 
                            className={`w-full p-3 rounded-xl border-0 focus:ring-2 focus:ring-primary/40 focus:outline-hidden transition-all text-sm font-bold bg-slate-100 dark:bg-zinc-800 ${isEn ? 'text-left' : 'text-right'}`}
                            style={{ color: tokens.textColor }}
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
                    <div className="mt-3 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {isEn 
                            ? `Required Amount to pay: ${cropsZakatKg.toFixed(2)} kg` 
                            : `المقدار الواجب إخراجه: ${cropsZakatKg.toFixed(2)} كجم`}
                    </div>
                )}
            </div>

            {/* 5. Livestock & Rikaz */}
            <div 
                id="zakat-card-livestock" 
                className="p-5 rounded-[18px] border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="font-bold mb-3 flex items-center gap-2" style={{ color: tokens.textColor }}>
                    <i className="fa-solid fa-cow text-orange-500"></i> 
                    <span>{isEn ? 'Livestock & Rikaz (Treasure)' : 'الأنعام والركاز'}</span>
                </h3>
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                    {renderInput(isEn ? 'Camels' : 'الإبل', camelsCount, setCamelsCount, isEn ? 'Nisab from 5' : 'النصاب من 5')}
                    {renderInput(isEn ? 'Cattle / Cows' : 'البقر', cowsCount, setCowsCount, isEn ? 'Nisab from 30' : 'النصاب من 30')}
                    {renderInput(isEn ? 'Sheep & Goats' : 'الغنم', sheepCount, setSheepCount, isEn ? 'Nisab from 40' : 'النصاب من 40')}
                </div>
                {livestockZakatText.length > 0 && (
                    <div className="mb-4 p-3 bg-orange-500/10 rounded-xl text-sm font-bold text-orange-600 dark:text-orange-400">
                        {isEn ? 'Livestock Zakat: ' : 'زكاة الأنعام: '}
                        {livestockZakatText.join(isEn ? ', ' : ' ، ')}
                    </div>
                )}
                <div className="border-t border-slate-100 dark:border-zinc-800 pt-3.5">
                    {renderInput(
                        isEn ? 'Rikaz & Minerals Value' : 'قيمة الركاز والمعادن', 
                        rikazValue, 
                        setRikazValue, 
                        isEn ? 'Buried treasure / extracted minerals (Due is 1/5: 20%)' : 'دفائن الأرض (الواجب فيه الخُمس 20%)'
                    )}
                </div>
            </div>

            {/* Final Summary - Flat Surface, Soft Elevation, Zero Border */}
            <div 
                id="zakat-card-summary" 
                className="mt-6 p-6 rounded-[22px] text-center relative overflow-hidden border-0"
                style={{ backgroundColor: tokens.cardBgColor, boxShadow: tokens.cardShadow }}
            >
                <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: tokens.textColor }}>
                    {isEn ? 'Final Cash Zakat Summary' : 'الملخص النهائي للزكاة النقدية'}
                </h3>
                
                <div className="flex justify-center items-baseline gap-2 mb-4">
                    <span className="text-5xl font-extrabold" style={{ color: tokens.primaryColor }}>
                        {totalZakatValue > 0 ? formatNumber(totalZakatValue) : '0'}
                    </span>
                </div>

                {totalZakatValue > 0 && (
                    <div className={`text-sm space-y-1.5 opacity-90 ${isEn ? 'text-left' : 'text-right'} max-w-xs mx-auto`} style={{ color: tokens.textColor }}>
                        {monetaryZakat > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Cash, Gold & Trade:' : 'المال والذهب والتجارة:'}</span> 
                                <span className="font-bold">{formatNumber(monetaryZakat)}</span>
                            </div>
                        )}
                        {cropsZakatValue > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Crops & Produce:' : 'الزروع والثمار:'}</span> 
                                <span className="font-bold">{formatNumber(cropsZakatValue)}</span>
                            </div>
                        )}
                        {rikazZakat > 0 && (
                            <div className="flex justify-between">
                                <span>{isEn ? 'Rikaz & Minerals:' : 'الركاز والمعادن:'}</span> 
                                <span className="font-bold">{formatNumber(rikazZakat)}</span>
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
