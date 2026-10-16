import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { RefreshCw } from 'lucide-react';

const KaffaratCalculator: React.FC<{ cardBorderColor?: string }> = ({ cardBorderColor: propCardBorderColor }) => {
    const { theme, themeKey } = useTheme();
    const isBlackTheme = theme.bgColor === '#000000' || theme.name === 'أبيض وأسود';
    const isDefaultTheme = themeKey === 'default' || !themeKey;
    const cardBorderColor = propCardBorderColor || (isDefaultTheme 
        ? '#000000' 
        : (isBlackTheme 
            ? '#FFFFFF' 
            : (theme.palette?.[0] || '#000000')));
    
    const [missedFastingDays, setMissedFastingDays] = useState('');
    const [fidyahFeedingCost, setFidyahFeedingCost] = useState('');
    
    const [yaminFeedingCost, setYaminFeedingCost] = useState('');

    const inputStyle: React.CSSProperties = {
        backgroundColor: theme.isOriginal ? '#fff' : 'rgba(255,255,255,0.05)',
        borderColor: cardBorderColor,
        borderWidth: '1.5px',
        borderStyle: 'solid',
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
                    <i className={`fa-solid fa-hand-holding-heart ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}></i> حساب الكفارات
                </h2>
                <button onClick={clearAll} className="flex items-center gap-1 text-sm text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    <RefreshCw size={14} /> إعادة ضبط
                </button>
            </div>

            {/* Fidyah */}
            <div className="themed-card p-5 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className={`fa-solid fa-bowl-food ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}></i> فدية الصيام
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    تجب على من عجز عن الصيام عجزاً لا يُرجى برؤه (كالكبير في السن والمريض مرضاً مزمناً).
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>عدد الأيام المفطرة</span>
                            <span className="text-[11px] opacity-70 font-normal">أيام رمضان غير المصومة</span>
                        </div>
                        <input type="number" placeholder="عدد الأيام" value={missedFastingDays} onChange={e => setMissedFastingDays(e.target.value)} className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-sm font-bold" style={inputStyle} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                            <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>تكلفة إطعام مسكين واحد</span>
                            <span className="text-[11px] opacity-70 font-normal">متوسط قيمة وجبة مشبعة</span>
                        </div>
                        <input type="number" placeholder="التكلفة" value={fidyahFeedingCost} onChange={e => setFidyahFeedingCost(e.target.value)} className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-primary focus:outline-hidden transition-all text-sm font-bold" style={inputStyle} />
                    </div>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-primary/10 flex justify-between items-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>إجمالي فدية الصيام: </span>
                    <span className={`text-2xl font-black ${isBlackTheme ? 'text-white' : (isDefaultTheme ? 'text-black' : 'text-primary')}`}>
                        {fidyahTotal > 0 ? fidyahTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            {/* Kaffarat Yamin */}
            <div className="themed-card p-5 rounded-xl" style={{ borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                <h3 className="text-lg font-bold mb-2 flex items-center gap-2" style={{ color: theme.textColor }}>
                    <i className="fa-solid fa-hand-sparkles text-blue-500"></i> كفارة اليمين
                </h3>
                <p className="text-xs mb-4 opacity-80" style={{ color: theme.textColor }}>
                    تجب عند الحنث في اليمين (الرجوع عن حلف). وهي إطعام عشرة مساكين من أوسط ما تطعمون أهليكم.
                </p>
                
                <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-1 mb-1">
                        <span className="text-sm font-bold opacity-80" style={{ color: theme.textColor }}>تكلفة الوجبة الواحدة</span>
                        <span className="text-[11px] opacity-70 font-normal">متوسط قيمة وجبة مشبعة</span>
                    </div>
                    <input type="number" placeholder="التكلفة" value={yaminFeedingCost} onChange={e => setYaminFeedingCost(e.target.value)} className="w-full p-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-hidden transition-all text-sm font-bold" style={inputStyle} />
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-blue-500/10 flex justify-between items-center" style={{ borderColor: cardBorderColor, borderWidth: '1px', borderStyle: 'solid' }}>
                    <span className="font-bold opacity-90" style={{ color: theme.textColor }}>إجمالي كفارة اليمين (10 مساكين): </span>
                    <span className="text-2xl font-black text-blue-500">
                        {yaminTotal > 0 ? yaminTotal.toFixed(2) : '0.00'}
                    </span>
                </div>
            </div>

            <div className="p-4 rounded-xl bg-black/5 dark:bg-white/5 text-xs opacity-70 text-center" style={{ color: theme.textColor, borderColor: cardBorderColor, borderWidth: '1.5px', borderStyle: 'solid' }}>
                * ملاحظة: الأصل في الكفارات والفدية هو إخراج الطعام عيناً (أرز، قمح، تمر) بمقدار مد أو نصف صاع حسب المذهب، وتجوز القيمة النقدية عند جماعة من أهل العلم تيسيراً على الفقراء.
            </div>
        </div>
    );
};

export default KaffaratCalculator;
