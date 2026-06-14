import React, { useState } from 'react';
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

const KaffaratCalculator: React.FC = () => {
    const { theme } = useTheme();
    
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [fidyahFeedingCost, setFidyahFeedingCost] = useState('');
    
    const [yaminFeedingCost, setYaminFeedingCost] = useState('');

    const inputStyle = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: theme.isOriginal ? '#e5e7eb' : 'rgba(255,255,255,0.2)',
        color: theme.textColor,
    };

    const clearAll = () => {
        setMissedFastingDays('');
        setFidyahFeedingCost('');
        setYaminFeedingCost('');
    };

    const fidyahTotal = (parseFloat(missedFastingDays) || 0) * (parseFloat(fidyahFeedingCost) || 0);
    const yaminTotal = (parseFloat(yaminFeedingCost) || 0) * 10;

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Header Actions */}
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-hand-holding-heart text-primary"></i> حساب الكفارات
                </h2>
                <button onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors">
                    <RefreshCw size={14} /> تنظيف
                </button>
            </div>

            {/* Fidyah */}
            <div className="themed-card p-5 rounded-xl border-l-4 border-primary">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-bowl-food text-primary"></i> فدية الصيام
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    تجب على من عجز عن الصيام عجزاً لا يُرجى برؤه (كالكبير في السن والمريض مرضاً مزمناً).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="flex items-center text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                            عدد الأيام المفطرة <Tooltip text="أيام رمضان التي لم يتم صيامها" />
                        </label>
                        <input type="number" placeholder="عدد الأيام" value={missedFastingDays} onChange={e => setMissedFastingDays(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition-all" style={inputStyle} />
                    </div>
                    <div>
                        <label className="flex items-center text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                            تكلفة إطعام مسكين واحد <Tooltip text="متوسط قيمة الوجبة المشبعة في بلدك" />
                        </label>
                        <input type="number" placeholder="التكلفة" value={fidyahFeedingCost} onChange={e => setFidyahFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none transition-all" style={inputStyle} />
                    </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-primary/10 flex justify-between items-center border border-primary/20">
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>إجمالي فدية الصيام: </span>
                    <span className="text-2xl font-black text-primary">
                        {fidyahTotal > 0 ? fidyahTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Kaffarat Yamin */}
            <div className="themed-card p-5 rounded-xl border-l-4 border-blue-500">
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-hand-sparkles text-blue-500"></i> كفارة اليمين
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    تجب عند الحنث في اليمين (الرجوع عن حلف). وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم.
                </p>
                
                <div>
                    <label className="flex items-center text-sm font-bold mb-1 opacity-80" style={{ color: theme.textColor }}>
                        تكلفة الوجبة الواحدة <Tooltip text="متوسط قيمة الوجبة المشبعة في بلدك" />
                    </label>
                    <input type="number" placeholder="التكلفة" value={yaminFeedingCost} onChange={e => setYaminFeedingCost(e.target.value)} className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all" style={inputStyle} />
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 flex justify-between items-center border border-blue-500/20">
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>إجمالي كفارة اليمين (10 مساكين): </span>
                    <span className="text-2xl font-black text-blue-500">
                        {yaminTotal > 0 ? yaminTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>
            
            <div className="mt-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-start gap-2">
                <Info className="text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" size={16} />
                <p className="text-xs leading-relaxed opacity-90" style={{ color: theme.textColor }}>
                    الأصل في الكفارات والفدية إخراجها طعاماً، ويجوز إخراج قيمتها نقداً عند بعض المذاهب إذا كان في ذلك مصلحة للفقير.
                </p>
            </div>
        </div>
    );
};

export default KaffaratCalculator;
