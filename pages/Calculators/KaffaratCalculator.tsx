import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const KaffaratCalculator: React.FC = () => {
    const { theme } = useTheme();
    
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [feedingCost, setFeedingCost] = useState('');

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
        fontFamily: 'Cairo, sans-serif'
    };

    return (
        <div className="themed-card p-5 rounded-xl space-y-6 animate-fade-in">
            <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-bowl-food text-primary"></i> فدية الصيام
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>عدد الأيام</label>
                        <input type="number" placeholder="الأيام" value={missedFastingDays} onChange={e => setMissedFastingDays(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>تكلفة إطعام مسكين</label>
                        <input type="number" placeholder="التكلفة" value={feedingCost} onChange={e => setFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                    </div>
                </div>
                <div className="mt-3 p-3 rounded-lg bg-primary/10 text-center">
                    <span className="font-bold opacity-80" style={{ color: theme.textColor }}>الإجمالي: </span>
                    <span className="text-xl font-bold text-primary">
                        {((parseFloat(missedFastingDays) || 0) * (parseFloat(feedingCost) || 0)).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="border-t pt-6" style={{ borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.1)' }}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-hand-holding-heart text-primary"></i> كفارة اليمين
                </h2>
                <p className="text-sm mb-3 opacity-80" style={{ color: theme.textColor }}>إطعام عشرة مساكين من أوسط ما تطعمون أهليكم</p>
                <div>
                    <label className="block text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>تكلفة الوجبة الواحدة</label>
                    <input type="number" placeholder="التكلفة" value={feedingCost} onChange={e => setFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:outline-none" style={inputStyle} />
                </div>
                <div className="mt-3 p-3 rounded-lg bg-primary/10 text-center">
                    <span className="font-bold opacity-80" style={{ color: theme.textColor }}>الإجمالي لـ 10 مساكين: </span>
                    <span className="text-xl font-bold text-primary">
                        {((parseFloat(feedingCost) || 0) * 10).toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default KaffaratCalculator;
