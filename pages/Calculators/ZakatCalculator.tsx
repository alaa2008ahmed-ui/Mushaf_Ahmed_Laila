import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const ZakatCalculator: React.FC = () => {
    const { theme } = useTheme();
    
    const [gold24Weight, setGold24Weight] = useState('');
    const [gold24Price, setGold24Price] = useState('');
    const [gold21Weight, setGold21Weight] = useState('');
    const [gold21Price, setGold21Price] = useState('');
    const [gold18Weight, setGold18Weight] = useState('');
    const [gold18Price, setGold18Price] = useState('');
    const [silverWeight, setSilverWeight] = useState('');
    const [silverPrice, setSilverPrice] = useState('');
    const [cashAmount, setCashAmount] = useState('');

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
        fontFamily: 'Cairo, sans-serif'
    };

    const calculateZakat = () => {
        const w24 = parseFloat(gold24Weight) || 0;
        const p24 = parseFloat(gold24Price) || 0;
        const w21 = parseFloat(gold21Weight) || 0;
        const p21 = parseFloat(gold21Price) || 0;
        const w18 = parseFloat(gold18Weight) || 0;
        const p18 = parseFloat(gold18Price) || 0;
        const sWeight = parseFloat(silverWeight) || 0;
        const sPrice = parseFloat(silverPrice) || 0;
        const cash = parseFloat(cashAmount) || 0;

        const hasInput = gold24Weight || gold21Weight || gold18Weight || silverWeight || cashAmount;
        
        const goldValue = (w24 * p24) + (w21 * p21) + (w18 * p18);
        const silverValue = sWeight * sPrice;
        const totalWealth = goldValue + silverValue + cash;
        
        // Nisab is 85g of 24k gold.
        let price24k = p24;
        if (price24k === 0 && p21 > 0) price24k = p21 * (24 / 21);
        if (price24k === 0 && p18 > 0) price24k = p18 * (24 / 18);
        
        const goldNisabValue = price24k > 0 ? 85 * price24k : 0;
        
        let zakatAmount = 0;
        if (goldNisabValue > 0 && totalWealth >= goldNisabValue) {
            zakatAmount = totalWealth * 0.025;
        } else if (goldNisabValue === 0 && totalWealth > 0) {
            zakatAmount = totalWealth * 0.025;
        }
        
        if (zakatAmount <= 0) {
            return hasInput ? 'لا يوجد زكاة' : '0.00';
        }
        return zakatAmount.toFixed(2);
    };

    return (
        <div className="themed-card p-5 rounded-xl space-y-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                <i className="fa-solid fa-coins text-primary"></i> حاسبة الزكاة
            </h2>
            
            <div className="space-y-3">
                <div>
                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>النقود والمدخرات</label>
                    <input type="number" placeholder="المبلغ" value={cashAmount} onChange={e => setCashAmount(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                </div>
                
                <div className="space-y-2">
                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>الذهب</label>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                        <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 24</span>
                        <input type="number" placeholder="الوزن (جرام)" value={gold24Weight} onChange={e => setGold24Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                        <input type="number" placeholder="سعر الجرام" value={gold24Price} onChange={e => setGold24Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                        <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 21</span>
                        <input type="number" placeholder="الوزن (جرام)" value={gold21Weight} onChange={e => setGold21Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                        <input type="number" placeholder="سعر الجرام" value={gold21Price} onChange={e => setGold21Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                    <div className="grid grid-cols-[auto_1fr_1fr] gap-3 items-center">
                        <span className="text-sm font-bold w-12" style={{ color: theme.textColor }}>عيار 18</span>
                        <input type="number" placeholder="الوزن (جرام)" value={gold18Weight} onChange={e => setGold18Weight(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                        <input type="number" placeholder="سعر الجرام" value={gold18Price} onChange={e => setGold18Price(e.target.value)} className="w-full p-2 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>وزن الفضة (جرام)</label>
                        <input type="number" placeholder="الوزن" value={silverWeight} onChange={e => setSilverWeight(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>سعر جرام الفضة</label>
                        <input type="number" placeholder="السعر" value={silverPrice} onChange={e => setSilverPrice(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                </div>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-center">
                <p className="text-sm font-bold opacity-80 mb-1" style={{ color: theme.textColor }}>مقدار الزكاة الواجب إخراجها</p>
                <p className={`${calculateZakat() === 'لا يوجد زكاة' ? 'text-xl' : 'text-3xl'} font-bold text-primary transition-all duration-300`}>
                    {calculateZakat()}
                </p>
            </div>
        </div>
    );
};

export default ZakatCalculator;
